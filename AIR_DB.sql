--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4
-- Dumped by pg_dump version 17.2

-- Started on 2025-03-14 21:26:47

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 16462)
-- Name: demandes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demandes (
    id integer NOT NULL,
    date_dmd timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    nature character varying(255) NOT NULL,
    motif text,
    etat integer DEFAULT 0,
    user_id integer NOT NULL,
    approved_by integer,
    CONSTRAINT demandes_etat_check CHECK ((etat = ANY (ARRAY[0, 1, 2])))
);


ALTER TABLE public.demandes OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16461)
-- Name: demandes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demandes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demandes_id_seq OWNER TO postgres;

--
-- TOC entry 3343 (class 0 OID 0)
-- Dependencies: 216
-- Name: demandes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demandes_id_seq OWNED BY public.demandes.id;


--
-- TOC entry 215 (class 1259 OID 16452)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    nomcomplet character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    groupeid integer DEFAULT 0 NOT NULL,
    password character varying(255) NOT NULL,
    date_entree date
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 16451)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 3344 (class 0 OID 0)
-- Dependencies: 214
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3180 (class 2604 OID 16465)
-- Name: demandes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes ALTER COLUMN id SET DEFAULT nextval('public.demandes_id_seq'::regclass);


--
-- TOC entry 3178 (class 2604 OID 16455)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3337 (class 0 OID 16462)
-- Dependencies: 217
-- Data for Name: demandes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demandes (id, date_dmd, date_debut, date_fin, nature, motif, etat, user_id, approved_by) FROM stdin;
6	2025-03-04 14:38:20.135465	2025-03-08	2025-03-28	annuel	mariage	1	1	\N
8	2025-03-07 02:11:41.057097	2025-03-21	2025-04-05	excep	mariage	1	1	\N
10	2025-03-07 17:22:29.607647	2025-04-05	2025-05-03	annuel	aucun	1	4	\N
11	2025-03-07 17:26:51.714048	2025-05-07	2025-03-22	excep	naissance	2	4	\N
12	2025-03-07 17:54:33.619942	2025-06-07	2025-05-24	annuel	naissance	2	4	\N
13	2025-03-08 15:08:27.694713	2025-03-26	2025-03-22	annuel	naissance	1	1	\N
14	2025-03-08 16:25:14.781651	2025-04-03	2025-03-21	excep	mariage	1	4	1
15	2025-03-09 12:19:33.54733	2025-03-27	2025-04-05	annuel	mariage	1	4	2
16	2025-03-11 09:40:56.025712	2025-04-02	2025-05-09	annuel	mariage	2	4	1
17	2025-03-12 10:12:19.160974	2025-03-21	2025-03-27	excep	naissance	1	4	1
\.


--
-- TOC entry 3335 (class 0 OID 16452)
-- Dependencies: 215
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nomcomplet, email, groupeid, password, date_entree) FROM stdin;
1	Ali Ben Salah	ali@admin.com	1	password1	2023-05-10
2	Sarah Amari	sarah@admin.com	1	password2	2022-08-15
3	Mehdi Karim	mehdi@employe.com	0	password3	2024-01-20
4	Leila Bouzid	leila@employe.com	0	password4	2021-12-05
5	Omar Haddad	omar@employe.com	0	password5	2020-07-30
6	Ali Benhaddou	ali.benhaddou1@example.com	0	AliBenhaddou1	\N
7	Yacine Bensalem	yacine.bensalem2@example.com	0	YacineBensalem2	\N
8	Sofia Merad	sofia.merad3@example.com	0	SofiaMerad3	\N
9	Nour Elhouda Mansouri	nour.mansouri4@example.com	0	NourMansouri4	\N
10	Karim Boudjema	karim.boudjema5@example.com	0	KarimBoudjema5	\N
11	Meriem Touati	meriem.touati6@example.com	0	MeriemTouati6	\N
12	Omar Saadi	omar.saadi7@example.com	0	OmarSaadi7	\N
13	Imene Ferhat	imene.ferhat8@example.com	0	ImeneFerhat8	\N
14	Rachid Khelifa	rachid.khelifa9@example.com	0	RachidKhelifa9	\N
15	Lina Ait Said	lina.aitsaid10@example.com	0	LinaAitSaid10	\N
16	Walid Bouzid	walid.bouzid11@example.com	0	WalidBouzid11	\N
17	Hana Djaballah	hana.djaballah12@example.com	0	HanaDjaballah12	\N
18	Mehdi Oulmane	mehdi.oulmane13@example.com	0	MehdiOulmane13	\N
19	Sarah Chemali	sarah.chemali14@example.com	0	SarahChemali14	\N
20	Adel Zeroual	adel.zeroual15@example.com	0	AdelZeroual15	\N
\.


--
-- TOC entry 3345 (class 0 OID 0)
-- Dependencies: 216
-- Name: demandes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demandes_id_seq', 17, true);


--
-- TOC entry 3346 (class 0 OID 0)
-- Dependencies: 214
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 20, true);


--
-- TOC entry 3189 (class 2606 OID 16472)
-- Name: demandes demandes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes
    ADD CONSTRAINT demandes_pkey PRIMARY KEY (id);


--
-- TOC entry 3185 (class 2606 OID 16459)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3187 (class 2606 OID 16457)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3190 (class 2606 OID 16478)
-- Name: demandes demandes_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes
    ADD CONSTRAINT demandes_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- TOC entry 3191 (class 2606 OID 16473)
-- Name: demandes fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-03-14 21:26:47

--
-- PostgreSQL database dump complete
--

