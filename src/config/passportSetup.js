const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Passport necesita "serializar" y "deserializar" usuarios para manejar la sesión.
// En nuestro caso, como solo usaremos la sesión para el flujo de OAuth,
// podemos simplemente pasar el perfil de Google directamente.
passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

// Aquí es donde le enseñamos a Passport a usar la estrategia de Google.
passport.use(
	new GoogleStrategy(
		{
			// --- Opciones de la Estrategia ---
			// Le pasamos las credenciales que obtuvimos de Google Cloud Console.
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			// Esta es la URL a la que Google redirigirá al usuario DESPUÉS
			// de que haya iniciado sesión. DEBE COINCIDIR EXACTAMENTE con la que
			// configuramos en la consola de Google.
			callbackURL: '/api/auth/google/callback',
		},
		/**
		 * @description Esta es la función "verify". Se ejecuta después de que Passport
		 * obtiene exitosamente el perfil del usuario de Google.
		 * @param {string} accessToken - El token que nos da Google para hablar con sus APIs (no lo usaremos).
		 * @param {string} refreshToken - Un token para refrescar el acceso a Google (no lo usaremos).
		 * @param {object} profile - El objeto con la información del perfil del usuario de Google.
		 * @param {function} done - El callback que debemos llamar cuando terminemos.
		 */
		(accessToken, refreshToken, profile, done) => {
			// 'profile' contiene los datos que nos interesan: id, nombre, email, etc.
			// Por ahora, simplemente pasamos el perfil completo al siguiente paso.
			// La lógica de buscar en nuestra BD la haremos en el controlador del callback.
			console.log('Perfil de Google recibido:', profile);
			// Llamamos a 'done' con null (sin errores) y el perfil del usuario.
			return done(null, profile);
		}
	)
);
