const pgp = require('pg-promise')()

const username = 'postgres'
const password = '01201989hvd'
const host = 'localhost'
const port = '5432'
const database = 'schedules'

const connection = `postgres://${username}:${password}@${host}:${port}/${database}`

const db = pgp(connection)

module.exports = db