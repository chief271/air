const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',      // Remplace par ton utilisateur PostgreSQL
    host: 'localhost',            // Laisse "localhost" si la base est locale
    database: 'AirAlgerie',     // Nom de ta base de données
    password: '0000', // Remplace par ton mot de passe PostgreSQL
    port: 5432,                   // Port par défaut de PostgreSQL
});

// Vérifier la connexion
pool.connect()
    .then(() => console.log('✅ Connecté à PostgreSQL'))
    .catch(err => console.error('❌ Erreur de connexion à PostgreSQL:', err));

module.exports = pool; // Exporter l'objet pool pour pouvoir l'utiliser ailleurs
