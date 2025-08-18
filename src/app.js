// Carga las variables de entorno desde .env
require('dotenv').config();
const session = require('express-session')
const passport = require('passport');
require('./config/passportSetup')
const express = require('express');
const cors = require('cors');
// Importamos morgan para el logger
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

/* Importar Enrutadores */
const solicitudRoutes = require('./api/routes/solicitudRoutes');
const authRoutes = require('./api/routes/authRoutes');
const dueñoRoutes = require('./api/routes/dueñoRoutes');
const adminRoutes = require('./api/routes/adminRoutes');

const app = express();

// Habilitar CORS
// Creamos un objeto de opciones para configurar CORS de forma segura.
const corsOptions = {
	// Le decimos a CORS que solo acepte peticiones desde el origen de nuestro frontend.
	origin: process.env.FRONTEND_URL,
	// Permitimos que el navegador envíe cookies de credenciales (para el futuro con HttpOnly).
	credentials: true,
};
app.use(cors(corsOptions));


/**** Configuracion de Session y Passport ****/
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: { secure: process.env.NODE_ENV === 'production' },
	})
);
// Inicializamos Passport.
app.use(passport.initialize())
// Usamos las sesiones de Passport.
app.use(passport.session())
/*********************************************************************************/

/**** Middleware para parsear cuerpos de peticion en formato JSON ****/
app.use(express.json());
app.use(cookieParser());

// Usamos el middleware morgan.
// 'dev' es un formato predefinido que nos da una salida concisa y coloreada
app.use(morgan('dev'));
/*********************************************************************************/

/****  Enrutadores ****/
// Ruta para el registro de nuevos usuarios
app.use('/api/solicitudes', solicitudRoutes);
// ruta de login
app.use('/api/auth', authRoutes);
// rutas de owner
app.use('/api/owner', dueñoRoutes);
// rutas de admin
app.use('/api/admin', adminRoutes);


// ruta de prueba de verificacion que el servidor funciona
app.get('/', (req, res) => {
	res.send('API de lifebit funcionando');
});
/*********************************************************************************/

/**** Importar manejador de errores ****/
const errorHandler = require('./middleware/errorHandler');
// Registramos el manejador de errores
app.use(errorHandler);
/*********************************************************************************/

module.exports = app;
