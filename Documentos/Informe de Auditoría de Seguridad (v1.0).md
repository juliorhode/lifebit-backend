1. Autenticación y Gestión de Sesiones
1.1. Contraseñas:
[✅] Almacenamiento: Usamos bcrypt. Cumplimos.
[✅] Transmisión: En producción, usaremos HTTPS. Cumplimos en diseño.
[ ] Complejidad: NO CUMPLIMOS. Actualmente no validamos la fortaleza de las contraseñas en finalizarRegistro o resetPassword. Un usuario puede establecer "123" como contraseña.
1.2. JSON Web Tokens (JWT):
[✅] accessToken / refreshToken: Usamos la arquitectura correcta. Cumplimos.
[✅] Secretos: Usamos variables de entorno. Cumplimos.
1.3. Protección de Tokens en el Cliente:
[✅] HttpOnly Cookie: Hemos implementado HttpOnly cookies para el refreshToken. Cumplimos.
1.4. Prevención de Fuerza Bruta:
[ ] Rate Limiting: NO CUMPLIMOS. No tenemos ningún middleware que limite los intentos de login. Nuestro endpoint /login es vulnerable a un ataque de diccionario lento.
[ ] Bloqueo de Cuentas: NO CUMPLIMOS. No tenemos lógica para bloquear una cuenta después de X intentos fallidos.
2. Autorización y Control de Acceso
2.1. Acceso Basado en Roles (RBAC):
[✅] protegeRuta / verificaRol: Nuestros middlewares están implementados y se usan correctamente. Cumplimos.
2.2. Aislamiento de Datos (Tenant Isolation):
[✅] Queries Ancladas: CUMPLIMOS. He verificado que todas las queries en los controladores del administrador (unidadController, recursoController, adminController) incluyen la cláusula WHERE id_edificio = $... o una validación equivalente. Esta es una de nuestras mayores fortalezas.
3. Seguridad de la Aplicación y los Datos
3.1. Validación de Entradas:
[✅] Validación en Controladores: Hacemos validaciones explícitas (if (!nombre || ...)). Cumplimos.
3.2. Prevención de Inyección de SQL:
[✅] Consultas Parametrizadas: Usamos pg y pg-format correctamente con placeholders. Cumplimos.
3.3. Prevención de XSS:
[ ] Saneamiento de Salida: NO APLICA AÚN. Aún no hemos construido los endpoints que guardan contenido enriquecido (como el foro o las noticias). Cuando los construyamos, deberemos implementar sanitize-html.
[ ] Cabeceras de Seguridad (helmet): NO CUMPLIMOS. No hemos añadido el middleware helmet a nuestra aplicación app.js.
3.4. Manejo de Archivos:
[✅] Validación de Tipo y Tamaño: Nuestro uploadMiddleware y spreadsheetUploadMiddleware usan fileFilter y limits. Cumplimos.
[✅] Almacenamiento: El plan es usar S3 en producción. Cumplimos en diseño.
4. Dependencias y Entorno
[~] Auditoría Regular: Hemos ejecutado npm audit cuando ha surgido, pero no tenemos un proceso formal. Cumplimos parcialmente.
[✅] Variables de Entorno: Usamos .env para todos los secretos. Cumplimos.
Resumen y Plan de Acción (Tareas de Seguridad Pendientes)
Hemos identificado 4 vulnerabilidades o debilidades claras que debemos solucionar para cumplir con nuestro propio manifiesto:
[ALTA] Tarea SEC-01: Implementar Rate Limiting en el endpoint de login (express-rate-limit).
[MEDIA] Tarea SEC-02: Implementar validación de fortaleza de contraseña en el backend.
[MEDIA] Tarea SEC-03: Añadir las cabeceras de seguridad a nuestra aplicación (helmet).
[BAJA] Tarea SEC-04: Implementar lógica de bloqueo de cuentas tras intentos fallidos.