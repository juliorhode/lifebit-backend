const CREA_LICENCIA = `insert into licencias (nombre_plan,caracteristicas) values ($1,$2) returning *;`
const TODAS_LICENCIAS = `select * from licencias order by id asc;`
const LICENCIAS_BY_ID = `select * from licencias where id = $1;`
const LICENCIAS_DELETE = `delete from licencias where id = $1 returning *;`

module.exports = {
    CREA_LICENCIA,
    TODAS_LICENCIAS,
    LICENCIAS_BY_ID,
    LICENCIAS_DELETE
}