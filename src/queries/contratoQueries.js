const REGISTRA_CONTRATO_PRUEBA = `insert into contratos (id_licencia,fecha_fin_prueba,estado,monto_mensual) values($1,$2,'en_prueba',$3) returning id`

module.exports = {
    REGISTRA_CONTRATO_PRUEBA
}