
const esHost = `${process.env.ES_PROTO}://${process.env.ES_HOST}:${process.env.ES_PORT}`;

export default {

    host: esHost,
    // log: 'warning',
    requestTimeout: 60000,
    // apiVersion: '6.8'
};
