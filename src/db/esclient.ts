// Copyright (C) 2019 Berkadia Commercial Mortgage, LLC - All Rights Reserved
import { Client } from '@elastic/elasticsearch';
import connection from './esconfig';

const client = new Client({
    node: connection.host,
    requestTimeout: connection.requestTimeout,
});
export default client;
