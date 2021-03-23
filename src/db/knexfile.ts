import path from 'path';


module.exports = {
    client: 'mysql2',
    connection: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER.trim(),
        password: process.env.MYSQL_PASSWORD.trim(),
        database: process.env.MYSQL_DATABASE,
        ssl: process.env.MYSQL_SSL ? 'Amazon RDS' : false,
    },
    migrations: {
        tableName: 'usersdata_knex_migrations',
        directory: path.join(__dirname, '/migrations')
    },
    pool: {
        min: 2,
        max: 10
    }
};
