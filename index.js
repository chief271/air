const express = require('express');
const path = require('path');
const pool = require('./db');
const session = require('express-session');
const PDFDocument = require('pdfkit');

// Create Express app
const app = express();
const PORT = 26655;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, images)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Configurer les sessions
app.use(session({
    secret: 'mon_secret', // Change ça pour plus de sécurité
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // true si HTTPS
}));

// Routes
app.get('/', (req, res) => {
    res.render('congeCard');
});
app.get("/administration", async (req, res) => {
    if (!req.session.user) {
        return res.render('auth');
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;
        const searchQuery = req.query.search || '';

        let params = [];
        let whereClause = 'WHERE u.groupeid = 0';

        // Add search conditions if search query exists
        if (searchQuery) {
            whereClause += ` AND (LOWER(u.nomcomplet) LIKE LOWER($1) OR CAST(u.id AS TEXT) LIKE $1)`;
            params.push(`%${searchQuery}%`);
        }

        // Get total count
        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM users u ${whereClause}`,
            params
        );
        const totalEmployees = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalEmployees / itemsPerPage);

        // Build query params for main query
        const queryParams = [...params]; // Copy search params if they exist
        queryParams.push(itemsPerPage, offset); // Add pagination params

        // Get employees with search and pagination
        const query = `
            SELECT 
                u.id,
                u.nomcomplet,
                u.date_entree,
                u.groupeid,
                COALESCE(SUM(
                    CASE WHEN d.etat = 1 
                    THEN DATE_PART('day', AGE(d.date_fin, d.date_debut)) 
                    ELSE 0 END
                ), 0) as total_days_taken
            FROM users u
            LEFT JOIN demandes d ON u.id = d.user_id
            ${whereClause}
            GROUP BY u.id, u.nomcomplet, u.date_entree, u.groupeid
            ORDER BY u.nomcomplet
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const result = await pool.query(query, queryParams);

        // Process employees
        const employees = result.rows.map(emp => {
            const dateEntree = new Date(emp.date_entree);
            const today = new Date();
            const yearsOfService = Math.floor((today - dateEntree) / (365.25 * 24 * 60 * 60 * 1000));

            const baseDays = 30;
            const daysUsed = parseInt(emp.total_days_taken) || 0;
            const remainingDays = baseDays - daysUsed;

            return {
                ...emp,
                years_of_service: yearsOfService,
                base_days: baseDays,
                days_used: daysUsed,
                remaining_days: remainingDays
            };
        });

        res.render('administration', {
            user: req.session.user,
            employees: employees,
            pagination: {
                page,
                totalPages,
                totalEmployees,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            searchQuery
        });

    } catch (err) {
        console.error('Error in /administration:', err);
        res.status(500).send("Erreur serveur: " + err.message);
    }
});
app.get('/gestionconge', async (req, res) => {
    if (!req.session.user) {
        res.render('auth');
    } else {
        const userId = req.session.user.id;

        try {
            const query = `
                SELECT 
                    id,
                    TO_CHAR(date_dmd, 'DD/MM/YYYY HH24:MI') as date_dmd,
                    TO_CHAR(date_debut, 'DD/MM/YYYY') as date_debut,
                    TO_CHAR(date_fin, 'DD/MM/YYYY') as date_fin,
                    nature,
                    motif,
                    etat,
                    user_id,
                    approved_by
                FROM demandes 
                WHERE user_id = $1
                ORDER BY date_dmd DESC`;

            const result = await pool.query(query, [userId]);
            res.render('gestionconge', {
                demandes: result.rows,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching demandes:', error);
            res.status(500).send('Server error');
        }
    }
});

app.get('/auth', (req, res) => {
    res.render('auth');
});

app.get('/test-db', async (req, res) => {
    try {

    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur de base de données');
    }
});

app.post('/auth', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);

        if (result.rows.length > 0) {
            var user = result.rows[0]; // Stocker l'utilisateur en session
            req.session.user = { id: user.id, groupeid: user.groupeid, nomcomplet: user.nomcomplet, date_entree: user.date_entree };

            return res.redirect('gestionconge'); // Rediriger après connexion
        } else {
            return res.render('auth', { error: 'Email ou mot de passe incorrect' });
        }
    } catch (err) {
        console.error(err);
        return res.render('auth', { error: 'Une erreur est survenue' });
    }
});

app.post('/add-demande', async (req, res) => {
    try {
        const { date_debut, date_fin, nature, motif } = req.body;
        const user_id = req.session.user.id; // Replace this with the logged-in user’s ID



        // Insert into the database
        await pool.query(
            `INSERT INTO demandes (date_debut, date_fin, nature, motif, etat, user_id) 
            VALUES ($1, $2, $3, $4, 0, $5)`,
            [date_debut, date_fin, nature, motif, user_id]
        );

        res.redirect('/gestionconge'); // Redirect to the dashboard
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});
app.get('/demande', async (req, res) => {
    try {
        // Get all demandes with requester and approver names
        const alldemande = await pool.query(
            `SELECT d.*, 
                    u1.nomcomplet,
                    u2.nomcomplet as approver_name
             FROM demandes d
             JOIN users u1 ON d.user_id = u1.id
             LEFT JOIN users u2 ON d.approved_by = u2.id`
        );

        // Check if session user exists before querying
        let userdemande = { rows: [] }; // Default empty array
        if (req.session.user && req.session.user.id) {
            userdemande = await pool.query(
                `SELECT d.*, 
                        u1.nomcomplet,
                        u2.nomcomplet as approver_name
                 FROM demandes d
                 JOIN users u1 ON d.user_id = u1.id
                 LEFT JOIN users u2 ON d.approved_by = u2.id
                 WHERE d.user_id = $1`,
                [req.session.user.id]
            );
        }

        console.log(alldemande.rows);

        res.render('demande', {
            demandes: alldemande.rows,
            user: req.session.user || {}, // Ensures user is always an object
            userdemandes: userdemande.rows
        });

    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Erreur serveur');
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.redirect('/gestionconge'); // Redirect back if error
        }
        res.redirect('/auth'); // Redirect to login after logout
    });
});
app.post('/update-etat/:id', async (req, res) => {
    const demandeId = req.params.id;
    const adminId = req.session.user.id; // Get the admin's ID who is approving

    try {
        // Update the "etat" field and add the admin who approved
        await pool.query(
            'UPDATE demandes SET etat = $1, approved_by = $2 WHERE id = $3',
            [1, adminId, demandeId]
        );

        res.redirect('/demande'); // Redirect to demande page after update
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la mise à jour de l'état");
    }
});

// annuler demande  
app.post('/annuler-demande/:id', async (req, res) => {
    const demandeId = req.params.id;
    const adminId = req.session.user.id; // Get the admin's ID who is refusing

    try {
        // Update the demande with refusal and admin who refused
        await pool.query(
            'UPDATE demandes SET etat = $1, approved_by = $2 WHERE id = $3',
            [2, adminId, demandeId]
        );

        res.redirect('/demande'); // Redirect to demande page after update
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la suppression de la demande");
    }
});


app.get('/download/:id', async (req, res) => {
    const requestId = parseInt(req.params.id, 10);
    try {
        // Fetch leave request details from database with formatted dates
        const result = await pool.query(
            `SELECT d.*, 
             TO_CHAR(d.date_dmd, 'DD/MM/YYYY HH24:MI') as formatted_date_dmd,
             TO_CHAR(d.date_debut, 'DD/MM/YYYY') as formatted_date_debut,
             TO_CHAR(d.date_fin, 'DD/MM/YYYY') as formatted_date_fin,
             u.nomcomplet as employee_name,
             a.nomcomplet as admin_name
             FROM demandes d 
             JOIN users u ON d.user_id = u.id 
             LEFT JOIN users a ON d.approved_by = a.id
             WHERE d.id = $1`,
            [requestId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Demande de congé introuvable.');
        }

        const leaveRequest = result.rows[0];

        // Set response headers for file download
        res.setHeader('Content-Disposition', `attachment; filename=demande_conge_${requestId}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');

        // Create a new PDF document
        const doc = new PDFDocument();
        doc.pipe(res);

        // Add Air Algérie Logo
        doc.image('public/imgs/Air_Algérie-Logo.wine.png', 50, 30, { width: 150 })
            .moveDown();

        // Title with styling
        doc.font('Helvetica-Bold')
            .fontSize(24)
            .text('Demande de Congé', { align: 'center' })
            .moveDown(4);

        // Add a horizontal line
        doc.moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown();

        // Employee Information with better formatting
        doc.font('Helvetica')
            .fontSize(14);

        // Create two columns
        const leftColumn = 50;
        const rightColumn = 300;
        const startY = doc.y;

        // Left column
        doc.text('Informations de la demande:', leftColumn, startY, { underline: true })
            .moveDown()
            .fontSize(12)
            .text(`ID de demande: ${leaveRequest.id}`, leftColumn)
            .text(`Date de demande: ${leaveRequest.formatted_date_dmd}`, leftColumn)
            .text(`Nature: ${leaveRequest.nature}`, leftColumn)
            .text(`Motif: ${leaveRequest.motif}`, leftColumn)
            .text(`Nom complet: ${leaveRequest.employee_name}`, leftColumn);

        // Right column
        doc.fontSize(14)
            .text('Période:', rightColumn, startY, { underline: true })
            .moveDown()
            .fontSize(12)
            .text(`Date de début: ${leaveRequest.formatted_date_debut}`, rightColumn)
            .text(`Date de fin: ${leaveRequest.formatted_date_fin}`, rightColumn);

        // Status section with colored box
        doc.moveDown(2)
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown();

        const status = leaveRequest.etat === 1 ? 'APPROUVÉ' : 'REFUSÉ';
        const statusColor = leaveRequest.etat === 1 ? '#28a745' : '#dc3545';

        doc.fillColor(statusColor)
            .fontSize(16)
            .text(`État: ${status}`, { align: 'center' })
            .fillColor('black');

        // Add admin name if available
        if (leaveRequest.admin_name) {
            doc.moveDown()
                .fontSize(12)
                .text(`Décision prise par: ${leaveRequest.admin_name}`, { align: 'center' });
        }

        // Footer
        doc.fontSize(10)
            .text('Air Algérie - Direction des Ressources Humaines', 50, doc.page.height - 50, {
                align: 'center',
                width: doc.page.width - 100
            });

        // Finish generating PDF
        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la génération du PDF.');
    }
});

app.get("/etat", async (req, res) => {
    if( req.session.user){
       
    res.render("etat", {
        user: req.session.user || {}, 
    });}
    else{
        res.redirect('auth');
    }
})
// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
