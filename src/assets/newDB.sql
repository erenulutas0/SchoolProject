--
-- PostgreSQL database dump
--

-- Dumped from database version 17rc1
-- Dumped by pg_dump version 17rc1

-- Started on 2025-05-26 22:48:15

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
-- TOC entry 222 (class 1259 OID 50632)
-- Name: aircrafts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aircrafts (
    aircraft_id integer NOT NULL,
    model character varying(100),
    total_seats integer,
    manufacturer character varying(100)
);


ALTER TABLE public.aircrafts OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 50631)
-- Name: aircrafts_aircraft_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aircrafts_aircraft_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aircrafts_aircraft_id_seq OWNER TO postgres;

--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 221
-- Name: aircrafts_aircraft_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aircrafts_aircraft_id_seq OWNED BY public.aircrafts.aircraft_id;


--
-- TOC entry 220 (class 1259 OID 50623)
-- Name: airports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.airports (
    airport_id integer NOT NULL,
    name character varying(100),
    city character varying(100),
    country character varying(100),
    code character(3)
);


ALTER TABLE public.airports OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 50622)
-- Name: airports_airport_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.airports_airport_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.airports_airport_id_seq OWNER TO postgres;

--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 219
-- Name: airports_airport_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.airports_airport_id_seq OWNED BY public.airports.airport_id;


--
-- TOC entry 226 (class 1259 OID 50664)
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    booking_id integer NOT NULL,
    user_id integer,
    booking_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20),
    CONSTRAINT bookings_status_check CHECK (((status)::text = ANY ((ARRAY['confirmed'::character varying, 'cancelled'::character varying, 'pending'::character varying])::text[])))
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 50663)
-- Name: bookings_booking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_booking_id_seq OWNER TO postgres;

--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 225
-- Name: bookings_booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_booking_id_seq OWNED BY public.bookings.booking_id;


--
-- TOC entry 224 (class 1259 OID 50639)
-- Name: flights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flights (
    flight_id integer NOT NULL,
    flight_number character varying(10),
    aircraft_id integer,
    departure_airport_id integer,
    arrival_airport_id integer,
    departure_time timestamp without time zone,
    arrival_time timestamp without time zone,
    status character varying(20),
    CONSTRAINT flights_status_check CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'cancelled'::character varying, 'departed'::character varying, 'arrived'::character varying])::text[])))
);


ALTER TABLE public.flights OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 50638)
-- Name: flights_flight_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.flights_flight_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.flights_flight_id_seq OWNER TO postgres;

--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 223
-- Name: flights_flight_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.flights_flight_id_seq OWNED BY public.flights.flight_id;


--
-- TOC entry 228 (class 1259 OID 50678)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    payment_id integer NOT NULL,
    booking_id integer,
    amount numeric(10,2),
    payment_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    method character varying(20),
    status character varying(20),
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY ((ARRAY['paid'::character varying, 'refunded'::character varying, 'failed'::character varying, 'pending'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 50677)
-- Name: payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_payment_id_seq OWNER TO postgres;

--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 227
-- Name: payments_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_payment_id_seq OWNED BY public.payments.payment_id;


--
-- TOC entry 232 (class 1259 OID 50714)
-- Name: seats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seats (
    seat_id integer NOT NULL,
    flight_id integer,
    seat_number character varying(5),
    class character varying(10),
    is_available boolean DEFAULT true,
    CONSTRAINT seats_class_check CHECK (((class)::text = ANY ((ARRAY['economy'::character varying, 'business'::character varying, 'first'::character varying])::text[])))
);


ALTER TABLE public.seats OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 50713)
-- Name: seats_seat_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seats_seat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seats_seat_id_seq OWNER TO postgres;

--
-- TOC entry 4957 (class 0 OID 0)
-- Dependencies: 231
-- Name: seats_seat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.seats_seat_id_seq OWNED BY public.seats.seat_id;


--
-- TOC entry 230 (class 1259 OID 50694)
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    ticket_id integer NOT NULL,
    booking_id integer,
    flight_id integer,
    seat_number character varying(5),
    class character varying(10),
    price numeric(10,2),
    ticket_code character varying(20),
    CONSTRAINT tickets_class_check CHECK (((class)::text = ANY ((ARRAY['economy'::character varying, 'business'::character varying, 'first'::character varying])::text[])))
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 50693)
-- Name: tickets_ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tickets_ticket_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_ticket_id_seq OWNER TO postgres;

--
-- TOC entry 4958 (class 0 OID 0)
-- Dependencies: 229
-- Name: tickets_ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tickets_ticket_id_seq OWNED BY public.tickets.ticket_id;


--
-- TOC entry 218 (class 1259 OID 50608)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    identification_number character(11) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_identification_number_check CHECK ((char_length(identification_number) = 11))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 50607)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 4959 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4733 (class 2604 OID 50635)
-- Name: aircrafts aircraft_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aircrafts ALTER COLUMN aircraft_id SET DEFAULT nextval('public.aircrafts_aircraft_id_seq'::regclass);


--
-- TOC entry 4732 (class 2604 OID 50626)
-- Name: airports airport_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.airports ALTER COLUMN airport_id SET DEFAULT nextval('public.airports_airport_id_seq'::regclass);


--
-- TOC entry 4735 (class 2604 OID 50667)
-- Name: bookings booking_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN booking_id SET DEFAULT nextval('public.bookings_booking_id_seq'::regclass);


--
-- TOC entry 4734 (class 2604 OID 50642)
-- Name: flights flight_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights ALTER COLUMN flight_id SET DEFAULT nextval('public.flights_flight_id_seq'::regclass);


--
-- TOC entry 4737 (class 2604 OID 50681)
-- Name: payments payment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN payment_id SET DEFAULT nextval('public.payments_payment_id_seq'::regclass);


--
-- TOC entry 4740 (class 2604 OID 50717)
-- Name: seats seat_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seats ALTER COLUMN seat_id SET DEFAULT nextval('public.seats_seat_id_seq'::regclass);


--
-- TOC entry 4739 (class 2604 OID 50697)
-- Name: tickets ticket_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets ALTER COLUMN ticket_id SET DEFAULT nextval('public.tickets_ticket_id_seq'::regclass);


--
-- TOC entry 4730 (class 2604 OID 50611)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 4936 (class 0 OID 50632)
-- Dependencies: 222
-- Data for Name: aircrafts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aircrafts (aircraft_id, model, total_seats, manufacturer) FROM stdin;
1	Boeing 737	30	Turkish Airlines
2	Airbus A320	30	Pegasus
3	Embraer 190	30	AnadoluJet
4	Airbus A321	30	SunExpress
5	Boeing 757	30	Onur Air
6	Boeing 727	30	Freebird
7	Airbus A319	30	Corendon
8	ATR 72	30	AtlasGlobal
9	CRJ 900	30	Mavi Gök
10	Airbus A220	30	Air Anatolia
\.


--
-- TOC entry 4934 (class 0 OID 50623)
-- Dependencies: 220
-- Data for Name: airports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.airports (airport_id, name, city, country, code) FROM stdin;
1	Istanbul Airport	Istanbul	Turkey	IST
2	Ankara Esenboga Airport	Ankara	Turkey	ESB
3	Izmir Adnan Menderes Airport	Izmir	Turkey	ADB
4	Antalya Airport	Antalya	Turkey	AYT
5	Trabzon Airport	Trabzon	Turkey	TZX
6	Dalaman Airport	Mugla	Turkey	DLM
\.


--
-- TOC entry 4940 (class 0 OID 50664)
-- Dependencies: 226
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (booking_id, user_id, booking_time, status) FROM stdin;
1	1	2025-05-20 12:00:00	confirmed
2	2	2025-05-20 12:00:00	confirmed
3	3	2025-05-20 12:00:00	confirmed
4	4	2025-05-20 12:00:00	confirmed
5	5	2025-05-20 12:00:00	confirmed
6	6	2025-05-20 12:00:00	confirmed
7	7	2025-05-20 12:00:00	confirmed
8	8	2025-05-20 12:00:00	confirmed
9	9	2025-05-20 12:00:00	confirmed
10	10	2025-05-20 12:00:00	confirmed
11	11	2025-05-20 12:00:00	confirmed
12	12	2025-05-20 12:00:00	confirmed
13	13	2025-05-20 12:00:00	confirmed
14	14	2025-05-20 12:00:00	confirmed
15	15	2025-05-20 12:00:00	confirmed
16	16	2025-05-20 12:00:00	confirmed
17	17	2025-05-20 12:00:00	confirmed
18	18	2025-05-20 12:00:00	confirmed
19	19	2025-05-20 12:00:00	confirmed
20	20	2025-05-20 12:00:00	confirmed
21	21	2025-05-21 14:00:00	confirmed
22	22	2025-05-21 14:00:00	confirmed
23	23	2025-05-21 14:00:00	confirmed
24	24	2025-05-21 14:00:00	confirmed
25	25	2025-05-21 14:00:00	confirmed
26	26	2025-05-21 14:00:00	confirmed
27	27	2025-05-21 14:00:00	confirmed
28	28	2025-05-21 14:00:00	confirmed
29	29	2025-05-21 14:00:00	confirmed
30	30	2025-05-21 14:00:00	confirmed
31	31	2025-05-21 14:00:00	confirmed
32	32	2025-05-21 14:00:00	confirmed
33	33	2025-05-21 14:00:00	confirmed
34	34	2025-05-21 14:00:00	confirmed
35	35	2025-05-21 14:00:00	confirmed
36	36	2025-05-21 14:00:00	confirmed
37	37	2025-05-21 14:00:00	confirmed
38	38	2025-05-21 14:00:00	confirmed
39	39	2025-05-21 14:00:00	confirmed
40	40	2025-05-21 14:00:00	confirmed
41	41	2025-05-22 15:30:00	confirmed
42	42	2025-05-22 14:16:00	confirmed
43	43	2025-05-22 15:50:00	confirmed
44	44	2025-05-22 16:21:00	confirmed
45	45	2025-05-22 15:56:00	confirmed
46	46	2025-05-22 16:26:00	confirmed
47	47	2025-05-22 15:27:00	confirmed
48	48	2025-05-22 15:05:00	confirmed
49	49	2025-05-22 16:11:00	confirmed
50	50	2025-05-22 15:38:00	confirmed
51	51	2025-05-22 15:40:00	confirmed
52	52	2025-05-22 16:37:00	confirmed
53	53	2025-05-22 14:10:00	confirmed
54	54	2025-05-22 15:47:00	confirmed
55	55	2025-05-22 16:48:00	confirmed
56	56	2025-05-23 13:17:00	confirmed
57	57	2025-05-23 14:28:00	confirmed
58	58	2025-05-23 14:45:00	confirmed
59	59	2025-05-23 13:28:00	confirmed
60	60	2025-05-23 14:22:00	confirmed
61	61	2025-05-23 15:21:00	confirmed
62	62	2025-05-23 15:10:00	confirmed
63	63	2025-05-23 13:12:00	confirmed
64	64	2025-05-23 15:54:00	confirmed
65	65	2025-05-23 13:11:00	confirmed
66	66	2025-05-23 14:10:00	confirmed
67	67	2025-05-23 13:39:00	confirmed
68	68	2025-05-23 14:56:00	confirmed
69	69	2025-05-24 10:34:00	confirmed
70	70	2025-05-24 10:06:00	confirmed
71	71	2025-05-24 11:52:00	confirmed
72	72	2025-05-24 11:32:00	confirmed
73	73	2025-05-24 11:05:00	confirmed
74	74	2025-05-24 11:01:00	confirmed
75	75	2025-05-24 11:49:00	confirmed
76	76	2025-05-24 12:00:00	confirmed
77	77	2025-05-24 10:47:00	confirmed
78	78	2025-05-24 10:52:00	confirmed
79	79	2025-05-24 10:04:00	confirmed
80	80	2025-05-25 11:11:00	confirmed
81	81	2025-05-25 11:25:00	confirmed
82	82	2025-05-25 11:19:00	confirmed
83	83	2025-05-25 11:38:00	confirmed
84	84	2025-05-25 11:10:00	confirmed
85	85	2025-05-25 11:23:00	confirmed
86	86	2025-05-25 11:38:00	confirmed
87	87	2025-05-25 11:11:00	confirmed
88	88	2025-05-25 11:45:00	confirmed
89	89	2025-05-25 12:24:00	confirmed
90	90	2025-05-26 11:28:00	confirmed
91	91	2025-05-26 09:50:00	confirmed
92	92	2025-05-26 09:52:00	confirmed
93	93	2025-05-26 11:44:00	confirmed
94	94	2025-05-26 09:51:00	confirmed
95	95	2025-05-26 09:10:00	confirmed
96	96	2025-05-26 09:49:00	confirmed
97	97	2025-05-26 10:55:00	confirmed
98	98	2025-05-26 10:43:00	confirmed
99	99	2025-05-26 10:30:00	confirmed
100	100	2025-05-26 10:13:00	confirmed
101	101	2025-05-26 10:06:00	confirmed
102	102	2025-05-26 10:55:00	confirmed
103	103	2025-05-26 11:37:00	confirmed
104	104	2025-05-26 10:47:00	confirmed
105	105	2025-05-26 10:12:00	confirmed
106	106	2025-05-26 11:28:00	confirmed
107	107	2025-05-26 09:26:00	confirmed
108	108	2025-05-26 09:03:00	confirmed
109	109	2025-05-26 11:05:00	confirmed
110	110	2025-05-26 09:54:00	confirmed
111	111	2025-05-26 11:00:00	confirmed
112	112	2025-05-26 09:18:00	confirmed
113	113	2025-05-26 10:55:00	confirmed
114	114	2025-05-26 11:21:00	confirmed
115	115	2025-05-27 11:03:00	confirmed
116	116	2025-05-27 10:23:00	confirmed
117	117	2025-05-27 11:11:00	confirmed
118	118	2025-05-27 10:27:00	confirmed
119	119	2025-05-27 10:41:00	confirmed
120	120	2025-05-27 10:37:00	confirmed
121	121	2025-05-27 10:41:00	confirmed
122	122	2025-05-27 11:28:00	confirmed
123	123	2025-05-27 10:03:00	confirmed
124	124	2025-05-27 11:02:00	confirmed
125	125	2025-05-28 14:30:00	confirmed
126	126	2025-05-28 14:07:00	confirmed
127	127	2025-05-28 14:40:00	confirmed
128	128	2025-05-28 14:39:00	confirmed
129	129	2025-05-28 14:25:00	confirmed
130	130	2025-05-28 14:34:00	confirmed
131	131	2025-05-28 14:58:00	confirmed
132	132	2025-05-29 13:09:00	confirmed
133	133	2025-05-29 13:14:00	confirmed
134	134	2025-05-29 13:52:00	confirmed
135	135	2025-05-29 13:59:00	confirmed
136	136	2025-05-29 13:53:00	confirmed
137	137	2025-05-29 13:34:00	confirmed
138	138	2025-05-29 14:16:00	confirmed
139	139	2025-05-29 13:54:00	confirmed
140	140	2025-05-29 14:02:00	confirmed
141	141	2025-05-29 14:19:00	confirmed
142	142	2025-05-29 13:35:00	confirmed
143	143	2025-05-29 13:26:00	confirmed
144	144	2025-05-29 14:22:00	confirmed
\.


--
-- TOC entry 4938 (class 0 OID 50639)
-- Dependencies: 224
-- Data for Name: flights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flights (flight_id, flight_number, aircraft_id, departure_airport_id, arrival_airport_id, departure_time, arrival_time, status) FROM stdin;
1	TK100	1	6	1	2025-06-01 08:00:00	2025-06-01 09:20:00	scheduled
2	TK101	2	1	4	2025-06-02 08:00:00	2025-06-02 09:20:00	scheduled
3	TK102	3	2	3	2025-06-03 08:00:00	2025-06-03 09:20:00	scheduled
4	TK103	4	2	1	2025-06-04 08:00:00	2025-06-04 09:20:00	scheduled
5	TK104	5	6	5	2025-06-05 08:00:00	2025-06-05 09:20:00	scheduled
6	TK105	6	1	6	2025-06-06 08:00:00	2025-06-06 09:20:00	scheduled
7	TK106	7	4	1	2025-06-07 08:00:00	2025-06-07 09:20:00	scheduled
8	TK107	8	1	2	2025-06-08 08:00:00	2025-06-08 09:20:00	scheduled
9	TK108	9	2	3	2025-06-09 08:00:00	2025-06-09 09:20:00	scheduled
10	TK109	10	5	6	2025-06-10 08:00:00	2025-06-10 09:20:00	scheduled
\.


--
-- TOC entry 4942 (class 0 OID 50678)
-- Dependencies: 228
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (payment_id, booking_id, amount, payment_time, method, status) FROM stdin;
1	1	1000.00	2025-05-20 12:05:00	credit_card	paid
2	2	1000.00	2025-05-20 12:05:00	credit_card	paid
3	3	750.00	2025-05-20 12:05:00	credit_card	paid
4	4	1500.00	2025-05-20 12:05:00	credit_card	paid
5	5	1500.00	2025-05-20 12:05:00	credit_card	paid
6	6	750.00	2025-05-20 12:05:00	credit_card	paid
7	7	750.00	2025-05-20 12:05:00	credit_card	paid
8	8	750.00	2025-05-20 12:05:00	credit_card	paid
9	9	1000.00	2025-05-20 12:05:00	credit_card	paid
10	10	750.00	2025-05-20 12:05:00	credit_card	paid
11	11	1000.00	2025-05-20 12:05:00	credit_card	paid
12	12	750.00	2025-05-20 12:05:00	credit_card	paid
13	13	1500.00	2025-05-20 12:05:00	credit_card	paid
14	14	750.00	2025-05-20 12:05:00	credit_card	paid
15	15	750.00	2025-05-20 12:05:00	credit_card	paid
16	16	1000.00	2025-05-20 12:05:00	credit_card	paid
17	17	1500.00	2025-05-20 12:05:00	credit_card	paid
18	18	1000.00	2025-05-20 12:05:00	credit_card	paid
19	19	1000.00	2025-05-20 12:05:00	credit_card	paid
20	20	1000.00	2025-05-20 12:05:00	credit_card	paid
21	21	1500.00	2025-05-21 14:29:00	bank_transfer	paid
22	22	1500.00	2025-05-21 14:37:00	bank_transfer	paid
23	23	1000.00	2025-05-21 14:58:00	credit_card	paid
24	24	1000.00	2025-05-21 14:14:00	paypal	paid
25	25	1000.00	2025-05-21 14:17:00	paypal	paid
26	26	1000.00	2025-05-21 14:04:00	credit_card	paid
27	27	750.00	2025-05-21 14:10:00	bank_transfer	paid
28	28	750.00	2025-05-21 14:03:00	credit_card	paid
29	29	750.00	2025-05-21 14:13:00	bank_transfer	paid
30	30	750.00	2025-05-21 14:47:00	paypal	paid
31	31	750.00	2025-05-21 14:47:00	bank_transfer	paid
32	32	750.00	2025-05-21 14:27:00	bank_transfer	paid
33	33	750.00	2025-05-21 14:28:00	bank_transfer	paid
34	34	750.00	2025-05-21 14:45:00	paypal	paid
35	35	750.00	2025-05-21 14:25:00	credit_card	paid
36	36	750.00	2025-05-21 14:24:00	paypal	paid
37	37	750.00	2025-05-21 14:42:00	credit_card	paid
38	38	750.00	2025-05-21 14:10:00	bank_transfer	paid
39	39	750.00	2025-05-21 14:07:00	bank_transfer	paid
40	40	750.00	2025-05-21 14:09:00	paypal	paid
41	41	1000.00	2025-05-22 15:59:00	credit_card	paid
42	42	1000.00	2025-05-22 15:40:00	bank_transfer	failed
43	43	1000.00	2025-05-22 15:17:00	bank_transfer	paid
44	44	1000.00	2025-05-22 15:40:00	bank_transfer	pending
45	45	1000.00	2025-05-22 15:05:00	credit_card	paid
46	46	1000.00	2025-05-22 15:23:00	bank_transfer	failed
47	47	1000.00	2025-05-22 15:56:00	credit_card	paid
48	48	750.00	2025-05-22 15:21:00	bank_transfer	paid
49	49	750.00	2025-05-22 15:48:00	credit_card	paid
50	50	750.00	2025-05-22 15:48:00	paypal	paid
51	51	750.00	2025-05-22 15:33:00	paypal	failed
52	52	750.00	2025-05-22 15:32:00	bank_transfer	paid
53	53	750.00	2025-05-22 15:42:00	credit_card	paid
54	54	750.00	2025-05-22 15:24:00	bank_transfer	paid
55	55	750.00	2025-05-22 15:48:00	paypal	paid
56	56	1500.00	2025-05-23 14:05:00	paypal	paid
57	57	1500.00	2025-05-23 14:56:00	credit_card	paid
58	58	1500.00	2025-05-23 14:40:00	paypal	paid
59	59	1500.00	2025-05-23 13:42:00	credit_card	paid
60	60	1500.00	2025-05-23 13:12:00	credit_card	paid
61	61	1000.00	2025-05-23 13:14:00	paypal	paid
62	62	1000.00	2025-05-23 13:26:00	credit_card	pending
63	63	1000.00	2025-05-23 13:44:00	bank_transfer	failed
64	64	750.00	2025-05-23 13:56:00	bank_transfer	paid
65	65	750.00	2025-05-23 15:00:00	credit_card	paid
66	66	750.00	2025-05-23 14:47:00	paypal	failed
67	67	750.00	2025-05-23 14:24:00	paypal	paid
68	68	750.00	2025-05-23 13:45:00	paypal	failed
69	69	1500.00	2025-05-24 11:19:00	credit_card	paid
70	70	1500.00	2025-05-24 11:02:00	bank_transfer	paid
71	71	1500.00	2025-05-24 10:59:00	bank_transfer	paid
72	72	1000.00	2025-05-24 10:05:00	credit_card	pending
73	73	1000.00	2025-05-24 10:45:00	bank_transfer	paid
74	74	1000.00	2025-05-24 10:08:00	credit_card	paid
75	75	750.00	2025-05-24 10:30:00	paypal	paid
76	76	750.00	2025-05-24 10:17:00	credit_card	paid
77	77	750.00	2025-05-24 11:23:00	paypal	paid
78	78	750.00	2025-05-24 10:52:00	credit_card	paid
79	79	750.00	2025-05-24 10:20:00	credit_card	failed
80	80	1500.00	2025-05-25 12:12:00	credit_card	paid
81	81	1500.00	2025-05-25 12:07:00	paypal	failed
82	82	1500.00	2025-05-25 11:54:00	bank_transfer	paid
83	83	1500.00	2025-05-25 11:48:00	bank_transfer	paid
84	84	1000.00	2025-05-25 12:23:00	paypal	pending
85	85	1000.00	2025-05-25 11:27:00	credit_card	failed
86	86	1000.00	2025-05-25 11:27:00	credit_card	pending
87	87	750.00	2025-05-25 12:12:00	credit_card	paid
88	88	750.00	2025-05-25 11:04:00	credit_card	paid
89	89	750.00	2025-05-25 11:32:00	credit_card	paid
90	90	1500.00	2025-05-26 09:58:00	credit_card	pending
91	91	1500.00	2025-05-26 10:58:00	credit_card	paid
92	92	1500.00	2025-05-26 10:17:00	bank_transfer	paid
93	93	1500.00	2025-05-26 11:40:00	credit_card	pending
94	94	1500.00	2025-05-26 11:05:00	paypal	paid
95	95	1000.00	2025-05-26 11:18:00	paypal	failed
96	96	1000.00	2025-05-26 11:30:00	paypal	pending
97	97	1000.00	2025-05-26 09:46:00	bank_transfer	pending
98	98	1000.00	2025-05-26 09:26:00	paypal	paid
99	99	1000.00	2025-05-26 10:21:00	paypal	paid
100	100	1000.00	2025-05-26 09:50:00	bank_transfer	paid
101	101	1000.00	2025-05-26 11:37:00	credit_card	paid
102	102	750.00	2025-05-26 09:23:00	bank_transfer	paid
103	103	750.00	2025-05-26 11:46:00	bank_transfer	paid
104	104	750.00	2025-05-26 10:27:00	bank_transfer	paid
105	105	750.00	2025-05-26 10:44:00	credit_card	failed
106	106	750.00	2025-05-26 10:56:00	paypal	paid
107	107	750.00	2025-05-26 09:58:00	paypal	paid
108	108	750.00	2025-05-26 10:43:00	bank_transfer	paid
109	109	750.00	2025-05-26 11:57:00	credit_card	failed
110	110	750.00	2025-05-26 09:15:00	bank_transfer	pending
111	111	750.00	2025-05-26 10:39:00	bank_transfer	paid
112	112	750.00	2025-05-26 10:34:00	bank_transfer	paid
113	113	750.00	2025-05-26 10:06:00	paypal	paid
114	114	750.00	2025-05-26 09:38:00	paypal	paid
115	115	1500.00	2025-05-27 11:14:00	credit_card	paid
116	116	1000.00	2025-05-27 10:31:00	paypal	paid
117	117	1000.00	2025-05-27 11:26:00	paypal	paid
118	118	1000.00	2025-05-27 10:24:00	credit_card	paid
119	119	1000.00	2025-05-27 10:34:00	bank_transfer	paid
120	120	750.00	2025-05-27 10:16:00	credit_card	paid
121	121	750.00	2025-05-27 11:07:00	credit_card	failed
122	122	750.00	2025-05-27 10:44:00	bank_transfer	paid
123	123	750.00	2025-05-27 11:29:00	credit_card	paid
124	124	750.00	2025-05-27 10:42:00	bank_transfer	paid
125	125	1500.00	2025-05-28 14:27:00	paypal	paid
126	126	1500.00	2025-05-28 14:55:00	credit_card	paid
127	127	1000.00	2025-05-28 14:34:00	paypal	paid
128	128	1000.00	2025-05-28 14:22:00	bank_transfer	paid
129	129	1000.00	2025-05-28 14:15:00	credit_card	pending
130	130	750.00	2025-05-28 14:30:00	paypal	paid
131	131	750.00	2025-05-28 14:31:00	bank_transfer	paid
132	132	1500.00	2025-05-29 13:48:00	paypal	pending
133	133	1500.00	2025-05-29 13:48:00	bank_transfer	paid
134	134	1000.00	2025-05-29 13:38:00	credit_card	paid
135	135	1000.00	2025-05-29 13:17:00	bank_transfer	pending
136	136	1000.00	2025-05-29 13:22:00	paypal	pending
137	137	1000.00	2025-05-29 13:24:00	credit_card	paid
138	138	1000.00	2025-05-29 13:50:00	credit_card	paid
139	139	750.00	2025-05-29 13:47:00	paypal	paid
140	140	750.00	2025-05-29 13:22:00	credit_card	paid
141	141	750.00	2025-05-29 13:39:00	credit_card	paid
142	142	750.00	2025-05-29 13:13:00	credit_card	paid
143	143	750.00	2025-05-29 13:28:00	paypal	paid
144	144	750.00	2025-05-29 13:34:00	credit_card	paid
\.


--
-- TOC entry 4946 (class 0 OID 50714)
-- Dependencies: 232
-- Data for Name: seats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seats (seat_id, flight_id, seat_number, class, is_available) FROM stdin;
5	1	A5	first	t
14	1	B9	business	t
15	1	B10	business	t
24	1	C9	economy	t
25	1	C10	economy	t
26	1	C11	economy	t
27	1	C12	economy	t
28	1	C13	economy	t
29	1	C14	economy	t
30	1	C15	economy	t
32	2	A2	first	t
33	2	A3	first	t
35	2	A5	first	t
36	2	B1	business	t
38	2	B3	business	t
41	2	B6	business	t
42	2	B7	business	t
43	2	B8	business	t
45	2	B10	business	t
59	2	C14	economy	t
61	3	A1	first	t
62	3	A2	first	t
63	3	A3	first	t
64	3	A4	first	t
65	3	A5	first	t
67	3	B2	business	t
68	3	B3	business	t
72	3	B7	business	t
73	3	B8	business	t
75	3	B10	business	t
76	3	C1	economy	t
77	3	C2	economy	t
80	3	C5	economy	t
82	3	C7	economy	t
85	3	C10	economy	t
86	3	C11	economy	t
87	3	C12	economy	t
88	3	C13	economy	t
96	4	B1	business	t
97	4	B2	business	t
98	4	B3	business	t
99	4	B4	business	t
100	4	B5	business	t
101	4	B6	business	t
102	4	B7	business	t
105	4	B10	business	t
106	4	C1	economy	t
107	4	C2	economy	t
109	4	C4	economy	t
110	4	C5	economy	t
111	4	C6	economy	t
112	4	C7	economy	t
114	4	C9	economy	t
115	4	C10	economy	t
116	4	C11	economy	t
117	4	C12	economy	t
118	4	C13	economy	t
120	4	C15	economy	t
122	5	A2	first	t
124	5	A4	first	t
127	5	B2	business	t
128	5	B3	business	t
129	5	B4	business	t
131	5	B6	business	t
132	5	B7	business	t
133	5	B8	business	t
134	5	B9	business	t
138	5	C3	economy	t
139	5	C4	economy	t
142	5	C7	economy	t
143	5	C8	economy	t
144	5	C9	economy	t
145	5	C10	economy	t
146	5	C11	economy	t
147	5	C12	economy	t
148	5	C13	economy	t
149	5	C14	economy	t
150	5	C15	economy	t
152	6	A2	first	t
153	6	A3	first	t
156	6	B1	business	t
157	6	B2	business	t
31	2	A1	first	f
34	2	A4	first	f
37	2	B2	business	f
39	2	B4	business	f
40	2	B5	business	f
44	2	B9	business	f
46	2	C1	economy	f
47	2	C2	economy	f
48	2	C3	economy	f
49	2	C4	economy	f
50	2	C5	economy	f
51	2	C6	economy	f
52	2	C7	economy	f
53	2	C8	economy	f
54	2	C9	economy	f
55	2	C10	economy	f
56	2	C11	economy	f
57	2	C12	economy	f
66	3	B1	business	f
69	3	B4	business	f
70	3	B5	business	f
71	3	B6	business	f
74	3	B9	business	f
78	3	C3	economy	f
79	3	C4	economy	f
81	3	C6	economy	f
83	3	C8	economy	f
84	3	C9	economy	f
89	3	C14	economy	f
90	3	C15	economy	f
91	4	A1	first	f
92	4	A2	first	f
93	4	A3	first	f
94	4	A4	first	f
95	4	A5	first	f
103	4	B8	business	f
104	4	B9	business	f
108	4	C3	economy	f
113	4	C8	economy	f
119	4	C14	economy	f
121	5	A1	first	f
123	5	A3	first	f
125	5	A5	first	f
126	5	B1	business	f
130	5	B5	business	f
135	5	B10	business	f
136	5	C1	economy	f
137	5	C2	economy	f
140	5	C5	economy	f
141	5	C6	economy	f
151	6	A1	first	f
154	6	A4	first	f
155	6	A5	first	f
158	6	B3	business	t
159	6	B4	business	t
161	6	B6	business	t
162	6	B7	business	t
163	6	B8	business	t
164	6	B9	business	t
166	6	C1	economy	t
167	6	C2	economy	t
168	6	C3	economy	t
171	6	C6	economy	t
172	6	C7	economy	t
173	6	C8	economy	t
175	6	C10	economy	t
176	6	C11	economy	t
177	6	C12	economy	t
178	6	C13	economy	t
179	6	C14	economy	t
180	6	C15	economy	t
186	7	B1	business	t
187	7	B2	business	t
189	7	B4	business	t
193	7	B8	business	t
196	7	C1	economy	t
200	7	C5	economy	t
202	7	C7	economy	t
205	7	C10	economy	t
211	8	A1	first	t
212	8	A2	first	t
213	8	A3	first	t
214	8	A4	first	t
216	8	B1	business	t
217	8	B2	business	t
218	8	B3	business	t
220	8	B5	business	t
222	8	B7	business	t
225	8	B10	business	t
227	8	C2	economy	t
228	8	C3	economy	t
230	8	C5	economy	t
231	8	C6	economy	t
233	8	C8	economy	t
234	8	C9	economy	t
235	8	C10	economy	t
236	8	C11	economy	t
237	8	C12	economy	t
238	8	C13	economy	t
240	8	C15	economy	t
243	9	A3	first	t
244	9	A4	first	t
245	9	A5	first	t
248	9	B3	business	t
249	9	B4	business	t
250	9	B5	business	t
251	9	B6	business	t
252	9	B7	business	t
253	9	B8	business	t
254	9	B9	business	t
256	9	C1	economy	t
257	9	C2	economy	t
258	9	C3	economy	t
259	9	C4	economy	t
260	9	C5	economy	t
261	9	C6	economy	t
262	9	C7	economy	t
263	9	C8	economy	t
264	9	C9	economy	t
265	9	C10	economy	t
266	9	C11	economy	t
267	9	C12	economy	t
268	9	C13	economy	t
271	10	A1	first	t
272	10	A2	first	t
273	10	A3	first	t
277	10	B2	business	t
278	10	B3	business	t
279	10	B4	business	t
281	10	B6	business	t
285	10	B10	business	t
286	10	C1	economy	t
289	10	C4	economy	t
292	10	C7	economy	t
293	10	C8	economy	t
295	10	C10	economy	t
296	10	C11	economy	t
298	10	C13	economy	t
299	10	C14	economy	t
300	10	C15	economy	t
1	1	A1	first	f
2	1	A2	first	f
3	1	A3	first	f
4	1	A4	first	f
6	1	B1	business	f
7	1	B2	business	f
8	1	B3	business	f
9	1	B4	business	f
10	1	B5	business	f
11	1	B6	business	f
12	1	B7	business	f
13	1	B8	business	f
16	1	C1	economy	f
17	1	C2	economy	f
181	7	A1	first	f
182	7	A2	first	f
183	7	A3	first	f
184	7	A4	first	f
215	8	A5	first	f
219	8	B4	business	f
221	8	B6	business	f
223	8	B8	business	f
224	8	B9	business	f
226	8	C1	economy	f
229	8	C4	economy	f
232	8	C7	economy	f
239	8	C14	economy	f
241	9	A1	first	f
242	9	A2	first	f
246	9	B1	business	f
247	9	B2	business	f
255	9	B10	business	f
269	9	C14	economy	f
270	9	C15	economy	f
274	10	A4	first	f
275	10	A5	first	f
276	10	B1	business	f
280	10	B5	business	f
282	10	B7	business	f
283	10	B8	business	f
284	10	B9	business	f
287	10	C2	economy	f
288	10	C3	economy	f
290	10	C5	economy	f
291	10	C6	economy	f
294	10	C9	economy	f
297	10	C12	economy	f
18	1	C3	economy	f
19	1	C4	economy	f
20	1	C5	economy	f
21	1	C6	economy	f
22	1	C7	economy	f
23	1	C8	economy	f
58	2	C13	economy	f
60	2	C15	economy	f
160	6	B5	business	f
165	6	B10	business	f
169	6	C4	economy	f
170	6	C5	economy	f
174	6	C9	economy	f
185	7	A5	first	f
188	7	B3	business	f
190	7	B5	business	f
191	7	B6	business	f
192	7	B7	business	f
194	7	B9	business	f
195	7	B10	business	f
197	7	C2	economy	f
198	7	C3	economy	f
199	7	C4	economy	f
201	7	C6	economy	f
203	7	C8	economy	f
204	7	C9	economy	f
206	7	C11	economy	f
207	7	C12	economy	f
208	7	C13	economy	f
209	7	C14	economy	f
210	7	C15	economy	f
\.


--
-- TOC entry 4944 (class 0 OID 50694)
-- Dependencies: 230
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (ticket_id, booking_id, flight_id, seat_number, class, price, ticket_code) FROM stdin;
1	1	1	A1	first	1500.00	TK100-A1
2	2	1	A2	first	1500.00	TK100-A2
3	3	1	A3	first	1500.00	TK100-A3
4	4	1	A4	first	1500.00	TK100-A4
5	5	1	B1	business	1000.00	TK100-B1
6	6	1	B2	business	1000.00	TK100-B2
7	7	1	B3	business	1000.00	TK100-B3
8	8	1	B4	business	1000.00	TK100-B4
9	9	1	B5	business	1000.00	TK100-B5
10	10	1	B6	business	1000.00	TK100-B6
11	11	1	B7	business	1000.00	TK100-B7
12	12	1	B8	business	1000.00	TK100-B8
13	13	1	C1	economy	750.00	TK100-C1
14	14	1	C2	economy	750.00	TK100-C2
15	15	1	C3	economy	750.00	TK100-C3
16	16	1	C4	economy	750.00	TK100-C4
17	17	1	C5	economy	750.00	TK100-C5
18	18	1	C6	economy	750.00	TK100-C6
19	19	1	C7	economy	750.00	TK100-C7
20	20	1	C8	economy	750.00	TK100-C8
21	21	2	A1	first	1500.00	TK101-A1
22	22	2	A4	first	1500.00	TK101-A4
23	23	2	B2	business	1000.00	TK101-B2
24	24	2	B4	business	1000.00	TK101-B4
25	25	2	B5	business	1000.00	TK101-B5
26	26	2	B9	business	1000.00	TK101-B9
27	27	2	C1	economy	750.00	TK101-C1
28	28	2	C2	economy	750.00	TK101-C2
29	29	2	C3	economy	750.00	TK101-C3
30	30	2	C4	economy	750.00	TK101-C4
31	31	2	C5	economy	750.00	TK101-C5
32	32	2	C6	economy	750.00	TK101-C6
33	33	2	C7	economy	750.00	TK101-C7
34	34	2	C8	economy	750.00	TK101-C8
35	35	2	C9	economy	750.00	TK101-C9
36	36	2	C10	economy	750.00	TK101-C10
37	37	2	C11	economy	750.00	TK101-C11
38	38	2	C12	economy	750.00	TK101-C12
39	39	2	C13	economy	750.00	TK101-C13
40	40	2	C15	economy	750.00	TK101-C15
41	41	3	B1	business	1000.00	TK102-B1
42	42	3	B3	business	1000.00	TK102-B3
43	43	3	B4	business	1000.00	TK102-B4
44	44	3	B5	business	1000.00	TK102-B5
45	45	3	B6	business	1000.00	TK102-B6
46	46	3	B7	business	1000.00	TK102-B7
47	47	3	B9	business	1000.00	TK102-B9
48	48	3	C3	economy	750.00	TK102-C3
49	49	3	C4	economy	750.00	TK102-C4
50	50	3	C6	economy	750.00	TK102-C6
51	51	3	C7	economy	750.00	TK102-C7
52	52	3	C8	economy	750.00	TK102-C8
53	53	3	C9	economy	750.00	TK102-C9
54	54	3	C14	economy	750.00	TK102-C14
55	55	3	C15	economy	750.00	TK102-C15
56	56	4	A1	first	1500.00	TK103-A1
57	57	4	A2	first	1500.00	TK103-A2
58	58	4	A3	first	1500.00	TK103-A3
59	59	4	A4	first	1500.00	TK103-A4
60	60	4	A5	first	1500.00	TK103-A5
61	61	4	B8	business	1000.00	TK103-B8
62	62	4	B9	business	1000.00	TK103-B9
63	63	4	B10	business	1000.00	TK103-B10
64	64	4	C3	economy	750.00	TK103-C3
65	65	4	C8	economy	750.00	TK103-C8
66	66	4	C13	economy	750.00	TK103-C13
67	67	4	C14	economy	750.00	TK103-C14
68	68	4	C15	economy	750.00	TK103-C15
69	69	5	A1	first	1500.00	TK104-A1
70	70	5	A3	first	1500.00	TK104-A3
71	71	5	A5	first	1500.00	TK104-A5
72	72	5	B1	business	1000.00	TK104-B1
73	73	5	B5	business	1000.00	TK104-B5
74	74	5	B10	business	1000.00	TK104-B10
75	75	5	C1	economy	750.00	TK104-C1
76	76	5	C2	economy	750.00	TK104-C2
77	77	5	C5	economy	750.00	TK104-C5
78	78	5	C6	economy	750.00	TK104-C6
79	79	5	C15	economy	750.00	TK104-C15
80	80	6	A1	first	1500.00	TK105-A1
81	81	6	A2	first	1500.00	TK105-A2
82	82	6	A4	first	1500.00	TK105-A4
83	83	6	A5	first	1500.00	TK105-A5
84	84	6	B5	business	1000.00	TK105-B5
85	85	6	B9	business	1000.00	TK105-B9
86	86	6	B10	business	1000.00	TK105-B10
87	87	6	C4	economy	750.00	TK105-C4
88	88	6	C5	economy	750.00	TK105-C5
89	89	6	C9	economy	750.00	TK105-C9
90	90	7	A1	first	1500.00	TK106-A1
91	91	7	A2	first	1500.00	TK106-A2
92	92	7	A3	first	1500.00	TK106-A3
93	93	7	A4	first	1500.00	TK106-A4
94	94	7	A5	first	1500.00	TK106-A5
95	95	7	B1	business	1000.00	TK106-B1
96	96	7	B3	business	1000.00	TK106-B3
97	97	7	B5	business	1000.00	TK106-B5
98	98	7	B6	business	1000.00	TK106-B6
99	99	7	B7	business	1000.00	TK106-B7
100	100	7	B9	business	1000.00	TK106-B9
101	101	7	B10	business	1000.00	TK106-B10
102	102	7	C2	economy	750.00	TK106-C2
103	103	7	C3	economy	750.00	TK106-C3
104	104	7	C4	economy	750.00	TK106-C4
105	105	7	C5	economy	750.00	TK106-C5
106	106	7	C6	economy	750.00	TK106-C6
107	107	7	C8	economy	750.00	TK106-C8
108	108	7	C9	economy	750.00	TK106-C9
109	109	7	C10	economy	750.00	TK106-C10
110	110	7	C11	economy	750.00	TK106-C11
111	111	7	C12	economy	750.00	TK106-C12
112	112	7	C13	economy	750.00	TK106-C13
113	113	7	C14	economy	750.00	TK106-C14
114	114	7	C15	economy	750.00	TK106-C15
115	115	8	A5	first	1500.00	TK107-A5
116	116	8	B4	business	1000.00	TK107-B4
117	117	8	B6	business	1000.00	TK107-B6
118	118	8	B8	business	1000.00	TK107-B8
119	119	8	B9	business	1000.00	TK107-B9
120	120	8	C1	economy	750.00	TK107-C1
121	121	8	C3	economy	750.00	TK107-C3
122	122	8	C4	economy	750.00	TK107-C4
123	123	8	C7	economy	750.00	TK107-C7
124	124	8	C14	economy	750.00	TK107-C14
125	125	9	A1	first	1500.00	TK108-A1
126	126	9	A2	first	1500.00	TK108-A2
127	127	9	B1	business	1000.00	TK108-B1
128	128	9	B2	business	1000.00	TK108-B2
129	129	9	B10	business	1000.00	TK108-B10
130	130	9	C14	economy	750.00	TK108-C14
131	131	9	C15	economy	750.00	TK108-C15
132	132	10	A4	first	1500.00	TK109-A4
133	133	10	A5	first	1500.00	TK109-A5
134	134	10	B1	business	1000.00	TK109-B1
135	135	10	B5	business	1000.00	TK109-B5
136	136	10	B7	business	1000.00	TK109-B7
137	137	10	B8	business	1000.00	TK109-B8
138	138	10	B9	business	1000.00	TK109-B9
139	139	10	C2	economy	750.00	TK109-C2
140	140	10	C3	economy	750.00	TK109-C3
141	141	10	C5	economy	750.00	TK109-C5
142	142	10	C6	economy	750.00	TK109-C6
143	143	10	C9	economy	750.00	TK109-C9
144	144	10	C12	economy	750.00	TK109-C12
\.


--
-- TOC entry 4932 (class 0 OID 50608)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, full_name, email, identification_number, password_hash, created_at) FROM stdin;
1	Akar Ziyaettin Aslan Yüksel	sukufesakarya@petkim.net	41246013015	hashed2824	2025-05-26 21:12:53.643249
2	Suat Şafak	corlumestur@zorlu.com	20932266036	hashed4657	2025-05-26 21:12:53.643249
3	Yağızkurt Şensoy	aykutzengin@yahoo.com	10136505587	hashed7912	2025-05-26 21:12:53.643249
4	Çerçi Sezgin	rsama@bilir.com	41003814027	hashed2535	2025-05-26 21:12:53.643249
5	Kavurt Sakarya	necva40@hotmail.com	12585650756	hashed9279	2025-05-26 21:12:53.643249
6	Bayan Nuriyet Beste Durmuş Arslan	calimerdogan@gmail.com	98974626737	hashed4257	2025-05-26 21:12:53.643249
7	Dr. Asım Şuayp Bilgin	daslan@havelsan.com	41866594980	hashed9928	2025-05-26 21:12:53.643249
8	Dr. Hürdoğan Bilir	tevetoglurojnu@gmail.com	46890615212	hashed8359	2025-05-26 21:12:53.643249
9	Bay Müslum Kasim Aslan	baltas30@gulen.com	54764787985	hashed1106	2025-05-26 21:12:53.643249
10	Gülşa Şensoy	pakgunduz@yahoo.com	36437583152	hashed5552	2025-05-26 21:12:53.643249
11	Ertan Yaman	mihriye69@arsoy.net	19028924397	hashed6514	2025-05-26 21:12:53.643249
12	Bayan Aysuna Bilge Demir	tugcesafak@petrol.biz	57660033943	hashed7224	2025-05-26 21:12:53.643249
13	Şahdiye Ertaş Fırat	tarhanilper@gmail.com	46952721923	hashed6635	2025-05-26 21:12:53.643249
14	Narhanim Demir	daksu@gmail.com	73263716304	hashed1711	2025-05-26 21:12:53.643249
15	Tomurcuk İnönü	bilgepembesin@karadeniz.org	65500836001	hashed9785	2025-05-26 21:12:53.643249
16	Birgit Arsoy	tevetoglutorhan@yildirim.com	51025702129	hashed2291	2025-05-26 21:12:53.643249
17	Bay Ensari Semender Akça	guldivan@inonu.com	38249512383	hashed6925	2025-05-26 21:12:53.643249
18	Tuğcan Güçlü	gulmisal96@ihsanoglu.com	61973405392	hashed2139	2025-05-26 21:12:53.643249
19	Piran Nurda Dumanlı	yukselmuktedir@gmail.com	97846728339	hashed5554	2025-05-26 21:12:53.643249
20	Alışık Zengin	abuzarerdogan@sisecam.com	57943234281	hashed6977	2025-05-26 21:12:53.643249
21	Ferat Vaysal İnönü	qarsoy@aselsan.com	30455572868	hashed1631	2025-05-26 21:34:56.462759
22	Dr. Şennur Altınbike Zorlu Şafak	lgulen@gmail.com	70543080549	hashed8578	2025-05-26 21:34:56.462759
23	İlbek Bayzettin Kısakürek Manço	gabelkaradeniz@yaman.org	12615585002	hashed9163	2025-05-26 21:34:56.462759
24	Ümray Akçay	yorulmazmenisan@gmail.com	89166507234	hashed9422	2025-05-26 21:34:56.462759
25	Bay Şahat Aksu	birsen89@gmail.com	87082214796	hashed7100	2025-05-26 21:34:56.462759
26	Aykutalp Şefi Mansız	tugrulhan87@gmail.com	33166776163	hashed8111	2025-05-26 21:34:56.462759
27	Şemsettin Çorlu	akgunduzmuferrih@yahoo.com	26539383277	hashed1945	2025-05-26 21:34:56.462759
28	Gülder Şehreban Erdoğan Durmuş	emis56@guclu.org	28794168224	hashed3040	2025-05-26 21:34:56.462759
29	Hıfzullah Yaman	maynursezgin@sakarya.biz	79409315494	hashed2568	2025-05-26 21:34:56.462759
30	Bayan Fadile Adal Sakarya Akçay	seydayildirim@demir.info	93265894491	hashed9126	2025-05-26 21:34:56.462759
31	Sevgen Karadeniz	tcorlu@gmail.com	88477367553	hashed9301	2025-05-26 21:34:56.462759
32	Yaşattin Bilir	ugurihsanoglu@hotmail.com	20208815942	hashed3979	2025-05-26 21:34:56.462759
33	Jaruthip Tevetoğlu Zengin	ozokcu50@gmail.com	16782903819	hashed1801	2025-05-26 21:34:56.462759
34	Bay Yaltırak Korutürk	suvaribilgin@akar.biz	18340412523	hashed4057	2025-05-26 21:34:56.462759
35	Hadrey Yorulmaz Ertaş	yildirimalcan@roketsan.org	45631734964	hashed3715	2025-05-26 21:34:56.462759
36	Seyithan Hazrat Eraslan Bilgin	zinonu@yuksel.com	93847436995	hashed2262	2025-05-26 21:34:56.462759
37	Bay Selâtin Tayyip Seven	gsafak@akcay.com	90803698279	hashed2688	2025-05-26 21:34:56.462759
38	Mihriye Eraslan	yosmayuksel@yuksel.com	72804222997	hashed2000	2025-05-26 21:34:56.462759
39	Söyler Sezer	gucluzumre@yahoo.com	80137599126	hashed6427	2025-05-26 21:34:56.462759
40	Günaydin Bilgin	busranursener@arslan.info	27896348385	hashed8189	2025-05-26 21:34:56.462759
41	Rümeysa Soylu	hancerulugbey@gmail.com	76218479434	hashed5454	2025-05-26 21:51:11.358141
42	Nuretdin Yılmaz	emin40@petrol.com	49006374778	hashed5221	2025-05-26 21:51:11.358141
43	Feden Bilir	mansizibrahim@gmail.com	18682676522	hashed6549	2025-05-26 21:51:11.358141
44	Akgöl Canberk Hayrioğlu	icimbike51@yahoo.com	22932302729	hashed8934	2025-05-26 21:51:11.358141
45	Afer İnönü	ongen88@hotmail.com	26353777135	hashed5650	2025-05-26 21:51:11.358141
46	İzel Ülker	xcamurcuoglu@ergul.com	17083707045	hashed6096	2025-05-26 21:51:11.358141
47	Dr. Yasan Taşar Şafak	imrenkisakurek@yahoo.com	44939606894	hashed2091	2025-05-26 21:51:11.358141
48	Sittik Ertaş	gyorulmaz@sisecam.com	68915362287	hashed3525	2025-05-26 21:51:11.358141
49	Muarra Menfeat Aksu	mansizsebattin@gulen.com	68467036272	hashed2228	2025-05-26 21:51:11.358141
50	Laze Sevcan Dumanlı Akar	nurkan83@yahoo.com	17303381825	hashed3339	2025-05-26 21:51:11.358141
51	Bilgütay Yıldırım	lsakarya@hotmail.com	53689314423	hashed1527	2025-05-26 21:51:11.358141
52	Özdil Erdoğan	sezerersec@cetin.com	24259367572	hashed5126	2025-05-26 21:51:11.358141
53	Dr. Laika Nursim Öcalan Gülen	ozbilgefirat@gmail.com	10385809530	hashed7740	2025-05-26 21:51:11.358141
54	Günden Zengin	toktugarsoy@yahoo.com	81922661260	hashed6382	2025-05-26 21:51:11.358141
55	Üstün Akça	tarhanilsu@hotmail.com	99625882991	hashed9796	2025-05-26 21:51:11.358141
56	Emine. Durmuş	ulkuminonu@yahoo.com	28534732146	hashed9981	2025-05-26 22:04:54.818875
57	Bay Ünek Bilge	osensoy@inonu.net	82749553099	hashed9761	2025-05-26 22:04:54.818875
58	Necdat Bilir	safakbashan@soylu.com	33346830712	hashed4157	2025-05-26 22:04:54.818875
59	Alpin Sezer	zeride51@gmail.com	74886302455	hashed3533	2025-05-26 22:04:54.818875
60	Kaver Şensoy	rayla25@anadolu.com	85211751034	hashed4611	2025-05-26 22:04:54.818875
61	Koçkan Çetin	arsoydagistan@yahoo.com	75089866803	hashed9332	2025-05-26 22:04:54.818875
62	İnsaf Temime Sezer	bilginfilit@guclu.com	18709978626	hashed4557	2025-05-26 22:04:54.818875
63	Bayan Akmaral Nilcan Şafak	abdulbekir96@yahoo.com	27452621750	hashed7943	2025-05-26 22:04:54.818875
64	Dr. Fehmiye Nili Akar	rengulihsanoglu@hotmail.com	34362189161	hashed9173	2025-05-26 22:04:54.818875
65	Bay Bişar Aksu	hdurdu@hotmail.com	51008939541	hashed3110	2025-05-26 22:04:54.818875
66	Ünsever Şafak Öcalan	sfirat@sener.com	55950556121	hashed6555	2025-05-26 22:04:54.818875
67	Ziyaettin Yılmaz	cenan97@hotmail.com	43679511134	hashed2553	2025-05-26 22:04:54.818875
68	Bayan Serfinaz İlklima Çorlu Güçlü	beylerakdeniz@tofas.com	97037572567	hashed5455	2025-05-26 22:04:54.818875
69	Bay Erdemer İldem Bilgin	ddurmus@hotmail.com	82320765374	hashed4989	2025-05-26 22:10:00.937694
70	İmge Ülker	zaslan@hotmail.com	44332297077	hashed3653	2025-05-26 22:10:00.937694
71	Şide Demir	annak72@mansiz.info	84721172793	hashed5191	2025-05-26 22:10:00.937694
72	Çopur İnönü	kkaradeniz@yilmaz.com	81073613206	hashed8595	2025-05-26 22:10:00.937694
73	Cannur Sarıcabay Akça Ertaş	aihsanoglu@arsoy.info	63086745430	hashed6610	2025-05-26 22:10:00.937694
74	Dr. Muratcan Soylu	asensoy@karadeniz.info	14225583035	hashed5549	2025-05-26 22:10:00.937694
75	Recepali Ünsever Alemdar Hançer	hayrioglusahmettin@hotmail.com	83136183194	hashed2866	2025-05-26 22:10:00.937694
76	Sonad Bilge	muktedir79@yahoo.com	74564491484	hashed5230	2025-05-26 22:10:00.937694
77	Ürfettin Duran	beray48@tofas.info	93095909118	hashed3910	2025-05-26 22:10:00.937694
78	Savak Ergül	deha28@hotmail.com	71706694469	hashed5910	2025-05-26 22:10:00.937694
79	Bayan Dilhuş Meleknur Ertaş	teybetseven@petrol.net	70256130444	hashed4166	2025-05-26 22:10:00.937694
80	Mevlüt Durmuş	fakgunduz@yahoo.com	84899666993	hashed3252	2025-05-26 22:21:14.189521
81	Dr. Gürelcem Seyfullah Gül	islimeakar@gmail.com	78543298956	hashed5881	2025-05-26 22:21:14.189521
82	Dr. Şahnuray Çorlu Duran	inancli48@gmail.com	71070146647	hashed7232	2025-05-26 22:21:14.189521
83	Tonguç Ermutlu Akça Aslan	kisakurektercan@gmail.com	39543176853	hashed6407	2025-05-26 22:21:14.189521
84	Kefser Abiye Bilgin Gül	sermanakgunduz@kisakurek.com	74665057869	hashed4277	2025-05-26 22:21:14.189521
85	Muhammet Kısakürek	pyuksel@tofas.com	93549332568	hashed9993	2025-05-26 22:21:14.189521
86	Bayan Narhanim Gülen Seven	xakcay@hotmail.com	55278045942	hashed2490	2025-05-26 22:21:14.189521
87	Şendoğan Karadeniz	narslan@yahoo.com	46141354139	hashed9450	2025-05-26 22:21:14.189521
88	Dr. Bidayet Akgündüz Yorulmaz	fatmanurertas@gmail.com	23496567497	hashed9912	2025-05-26 22:21:14.189521
89	Dr. Turcein Hançer Hayrioğlu	ihsanogludagistan@hotmail.com	48422593320	hashed5278	2025-05-26 22:21:14.189521
90	Kamar Soyselçuk Tevetoğlu	gilmanhayrioglu@arslan.biz	88888895042	hashed1697	2025-05-26 22:26:21.977322
91	Zahid Aksu	ggulen@hotmail.com	79685225908	hashed1316	2025-05-26 22:26:21.977322
92	Dr. Şüküfe Yaman Durdu	cetinsudurmus@alemdar.biz	78619172646	hashed6262	2025-05-26 22:26:21.977322
93	Dr. Kader Durdu	sagcangulen@arcelik.biz	97776410198	hashed5755	2025-05-26 22:26:21.977322
94	Bayan Sevginur Semat Yıldırım Akça	mansizushan@yahoo.com	34634403389	hashed7192	2025-05-26 22:26:21.977322
95	Yankı Nakip Durmuş	abdis45@arsoy.com	95523024212	hashed9465	2025-05-26 22:26:21.977322
96	Nebih Tarhan	baltasulker@anadolu.com	63163017546	hashed7108	2025-05-26 22:26:21.977322
97	Bay Erkinel Demirel	filitdurdu@hotmail.com	90425745355	hashed2783	2025-05-26 22:26:21.977322
98	Yetişal Barsen İnönü	teksoy32@vestel.com	46706347230	hashed8958	2025-05-26 22:26:21.977322
99	Bay Bahaddin Aksu	bozerkdumanli@gmail.com	29607688041	hashed3283	2025-05-26 22:26:21.977322
100	Fitnat Tevetoğlu Seven	ogetyaman@hotmail.com	84647949969	hashed3284	2025-05-26 22:26:21.977322
101	Ünek Alpcan Bilgin Akçay	akgunduzalmus@bilge.com	90801222707	hashed3530	2025-05-26 22:26:21.977322
102	Şehza Akar	cuheyna66@hotmail.com	88068763743	hashed7987	2025-05-26 22:26:21.977322
103	Gülcegün Kısakürek Korutürk	ozokcu36@hotmail.com	88877324971	hashed8055	2025-05-26 22:26:21.977322
104	Vargın Akgündüz	bdemir@gmail.com	42278551949	hashed9489	2025-05-26 22:26:21.977322
105	Akise Çorlu Aslan	ihsanoglusadiye@sisecam.com	48033583988	hashed4888	2025-05-26 22:26:21.977322
106	Yadigar Cavit Gül	ahsenakcay@gmail.com	38645905627	hashed7476	2025-05-26 22:26:21.977322
107	Gülbeyan Havali Gülen Yıldırım	gulensiti@hancer.org	11916410981	hashed7802	2025-05-26 22:26:21.977322
108	Bayan Hümeyra İhsanoğlu Türk	gencaysener@hotmail.com	11914309774	hashed8497	2025-05-26 22:26:21.977322
109	Behrem Ertaş	camurcuoglusoydaner@sok.net	91822259641	hashed7362	2025-05-26 22:26:21.977322
110	Dr. Semat Mujde Bilge Akçay	ergulmuvahhide@bilgin.info	80603452668	hashed6593	2025-05-26 22:26:21.977322
111	Alpcan Yaman	jankat35@yahoo.com	73176204256	hashed1746	2025-05-26 22:26:21.977322
112	Habibe Türcan Çamurcuoğlu	canur32@tarhan.com	12458393503	hashed9965	2025-05-26 22:26:21.977322
113	Serezli Fırat	ysener@akgunduz.com	58530897612	hashed5978	2025-05-26 22:26:21.977322
114	Nurgil Eraslan Tarhan	torel64@demirel.com	97479147715	hashed6988	2025-05-26 22:26:21.977322
115	Lâle Ürper Manço	dilcanertas@yahoo.com	88526694649	hashed6043	2025-05-26 22:32:19.774136
116	Özkent Aydınbey Ülker	ozalpsanturk@sener.biz	41205591851	hashed3525	2025-05-26 22:32:19.774136
117	Bay Göksev Mansız	tevetoglukitan@hancer.com	18146490399	hashed8921	2025-05-26 22:32:19.774136
118	Dr. Özdal Eral Duran	akcamonis@gmail.com	27976413035	hashed2510	2025-05-26 22:32:19.774136
119	Gülseren Gül	zorlutevs@arsoy.net	40264229153	hashed7388	2025-05-26 22:32:19.774136
120	Akkerman Akar Durmuş Gül	akcayozalpsan@a101.net	34593897500	hashed1150	2025-05-26 22:32:19.774136
121	Oguş Duran Sezer	unal57@zorlu.org	92919248469	hashed3140	2025-05-26 22:32:19.774136
122	Anka Dumanlı Eraslan	akdenizmuktedir@durmus.biz	93805104898	hashed3440	2025-05-26 22:32:19.774136
123	Oruç Noman Yıldırım	akcaannak@hotmail.com	89887705131	hashed1791	2025-05-26 22:32:19.774136
124	Arcan Akçay	fkaradeniz@gmail.com	52883522382	hashed2774	2025-05-26 22:32:19.774136
125	Dr. Mefharet Hürmet Güçlü Ülker	fkoruturk@ulker.com	50562655587	hashed8293	2025-05-26 22:36:30.789802
126	İlteriş Şener	bilginsilanur@gmail.com	61913467128	hashed5144	2025-05-26 22:36:30.789802
127	Hasret Aslan	camurcuoglunafile@ford.com	49524460592	hashed2286	2025-05-26 22:36:30.789802
128	Dr. Nevise Tagangül Sezer	akcayandic@sama.com	99449195883	hashed2211	2025-05-26 22:36:30.789802
129	Ahat Seyfullah Çamurcuoğlu Akça	ihsanogluozertem@yorulmaz.com	16920027193	hashed6029	2025-05-26 22:36:30.789802
130	Hidir Maksur Erdoğan	akarfadile@gmail.com	53499306292	hashed4644	2025-05-26 22:36:30.789802
131	Dr. Ferinaz Aylil Sezgin	ulkudesinonu@yahoo.com	92780161119	hashed4847	2025-05-26 22:36:30.789802
132	Görklü Şafak	qarslan@opet.info	67174546447	hashed2160	2025-05-26 22:41:35.303047
133	Dr. Razı Yaman	samiha26@sok.info	73509482709	hashed5034	2025-05-26 22:41:35.303047
134	Risalet Demir	zihniyildirim@gmail.com	25291953051	hashed5817	2025-05-26 22:41:35.303047
135	Vedat Ertaş	necva74@arslan.com	70920806821	hashed9108	2025-05-26 22:41:35.303047
136	Nefiye Çetin	hancercangur@yahoo.com	66552797351	hashed9561	2025-05-26 22:41:35.303047
137	Almast Mansız	busra96@sensoy.net	81462757879	hashed8502	2025-05-26 22:41:35.303047
138	Zeynelabidin Şemsettin Tevetoğlu Şafak	xalemdar@yahoo.com	25154147718	hashed1507	2025-05-26 22:41:35.303047
139	Cevheri Yılmaz	akar47@yahoo.com	31388272704	hashed7292	2025-05-26 22:41:35.303047
140	Dr. Ayasun Şennur Fırat Şener	tumer15@alemdar.com	38411964473	hashed7068	2025-05-26 22:41:35.303047
141	Korkmazalp Yıldırım	hilaydatarhan@sok.com	77018361332	hashed6217	2025-05-26 22:41:35.303047
142	Sadat Maksur Sakarya Durmuş	zuheyla69@vestel.com	49519302022	hashed6019	2025-05-26 22:41:35.303047
143	Okgüçlü Özalpsan Ülker	hurmetguclu@bilir.com	56906526192	hashed2139	2025-05-26 22:41:35.303047
144	Bayan Kifaye Ruhide Çorlu	ogetaksu@hotmail.com	20334468871	hashed6785	2025-05-26 22:41:35.303047
\.


--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 221
-- Name: aircrafts_aircraft_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aircrafts_aircraft_id_seq', 1, false);


--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 219
-- Name: airports_airport_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.airports_airport_id_seq', 1, false);


--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 225
-- Name: bookings_booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_booking_id_seq', 1, false);


--
-- TOC entry 4963 (class 0 OID 0)
-- Dependencies: 223
-- Name: flights_flight_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.flights_flight_id_seq', 1, false);


--
-- TOC entry 4964 (class 0 OID 0)
-- Dependencies: 227
-- Name: payments_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_payment_id_seq', 1, false);


--
-- TOC entry 4965 (class 0 OID 0)
-- Dependencies: 231
-- Name: seats_seat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seats_seat_id_seq', 1, false);


--
-- TOC entry 4966 (class 0 OID 0)
-- Dependencies: 229
-- Name: tickets_ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_ticket_id_seq', 1, false);


--
-- TOC entry 4967 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 144, true);


--
-- TOC entry 4759 (class 2606 OID 50637)
-- Name: aircrafts aircrafts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aircrafts
    ADD CONSTRAINT aircrafts_pkey PRIMARY KEY (aircraft_id);


--
-- TOC entry 4755 (class 2606 OID 50630)
-- Name: airports airports_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.airports
    ADD CONSTRAINT airports_code_key UNIQUE (code);


--
-- TOC entry 4757 (class 2606 OID 50628)
-- Name: airports airports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.airports
    ADD CONSTRAINT airports_pkey PRIMARY KEY (airport_id);


--
-- TOC entry 4765 (class 2606 OID 50671)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);


--
-- TOC entry 4761 (class 2606 OID 50647)
-- Name: flights flights_flight_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights
    ADD CONSTRAINT flights_flight_number_key UNIQUE (flight_number);


--
-- TOC entry 4763 (class 2606 OID 50645)
-- Name: flights flights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights
    ADD CONSTRAINT flights_pkey PRIMARY KEY (flight_id);


--
-- TOC entry 4767 (class 2606 OID 50687)
-- Name: payments payments_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_key UNIQUE (booking_id);


--
-- TOC entry 4769 (class 2606 OID 50685)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- TOC entry 4775 (class 2606 OID 50723)
-- Name: seats seats_flight_id_seat_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_flight_id_seat_number_key UNIQUE (flight_id, seat_number);


--
-- TOC entry 4777 (class 2606 OID 50721)
-- Name: seats seats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_pkey PRIMARY KEY (seat_id);


--
-- TOC entry 4771 (class 2606 OID 50700)
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (ticket_id);


--
-- TOC entry 4773 (class 2606 OID 50702)
-- Name: tickets tickets_ticket_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_ticket_code_key UNIQUE (ticket_code);


--
-- TOC entry 4749 (class 2606 OID 50619)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4751 (class 2606 OID 50621)
-- Name: users users_identification_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_identification_number_key UNIQUE (identification_number);


--
-- TOC entry 4753 (class 2606 OID 50617)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4781 (class 2606 OID 50672)
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4778 (class 2606 OID 50648)
-- Name: flights flights_aircraft_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights
    ADD CONSTRAINT flights_aircraft_id_fkey FOREIGN KEY (aircraft_id) REFERENCES public.aircrafts(aircraft_id);


--
-- TOC entry 4779 (class 2606 OID 50658)
-- Name: flights flights_arrival_airport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights
    ADD CONSTRAINT flights_arrival_airport_id_fkey FOREIGN KEY (arrival_airport_id) REFERENCES public.airports(airport_id);


--
-- TOC entry 4780 (class 2606 OID 50653)
-- Name: flights flights_departure_airport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights
    ADD CONSTRAINT flights_departure_airport_id_fkey FOREIGN KEY (departure_airport_id) REFERENCES public.airports(airport_id);


--
-- TOC entry 4782 (class 2606 OID 50688)
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id);


--
-- TOC entry 4785 (class 2606 OID 50724)
-- Name: seats seats_flight_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_flight_id_fkey FOREIGN KEY (flight_id) REFERENCES public.flights(flight_id);


--
-- TOC entry 4783 (class 2606 OID 50703)
-- Name: tickets tickets_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id);


--
-- TOC entry 4784 (class 2606 OID 50708)
-- Name: tickets tickets_flight_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_flight_id_fkey FOREIGN KEY (flight_id) REFERENCES public.flights(flight_id);


-- Completed on 2025-05-26 22:48:15

--
-- PostgreSQL database dump complete
--

