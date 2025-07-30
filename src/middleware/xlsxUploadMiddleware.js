const multer = require('multer');
const AppError = require('../utils/appError');

// Usamos 'multer.memoryStorage()' en lugar de 'diskStorage'.
// Esto le dice a multer que mantenga el archivo subido en la memoria RAM (como un Buffer),
// en lugar de guardarlo temporalmente en el disco.
// Es ideal para procesar archivos pequeños (como hojas de cálculo) directamente.
const storage = multer.memoryStorage();
// Para la subida de documentos (PDFs, imágenes), guardarlos en disco (diskStorage) tiene sentido. Pero para archivos que vamos a leer y procesar inmediatamente en el backend (como un Excel), mantenerlos en memoria es más eficiente. Evita operaciones de escritura/lectura innecesarias en el disco. ExcelJS puede leer un archivo directamente desde el "buffer" de memoria que multer nos proporcionará.

/**
 * @description Filtro para aceptar únicamente archivos de hojas de cálculo.
 */
const fileFilter = (req, file, cb) => {
     const tiposPermitidos = [
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
			'application/vnd.ms-excel' // .xls
     ];
    if (tiposPermitidos.includes(file.mimetype)) {
        // Aceptar el archivo
        cb(null, true);
    } else {
        // Rechazar el archivo  
        const error = new AppError('Tipo de archivo no permitido. Solo se aceptan archivos de Excel (.xlsx, .xls).', 400);
        cb(error, false);

    }
};
// Creamos y configuramos la instancia de Multer.
const uploadArchivoInventario = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, // Límite general de 5 MB
    },
});

// Exportamos el middleware listo para ser usado en una ruta.
// Usamos .single('archivoInventario') para indicar que esperamos un único archivo
// desde un campo de formulario llamado 'archivoInventario'.
module.exports = uploadArchivoInventario.single('archivoInventario');