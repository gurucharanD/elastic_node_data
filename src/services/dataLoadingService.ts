/* eslint-disable no-console */
import {
    Log,
} from '../utils/log';
import jsonfile from 'jsonfile';
import ESService from '../utils/esService';
import path from 'path';
import knex from '../db/knex';

class DataLoadService {
    public esService: ESService;

    constructor() {
        this.esService = new ESService();
    }


    public async bulkIndexData() {
        try {
            const usersData = jsonfile.readFileSync(path.join(__dirname, '/../Data/data.json'));
            let counter = 0;
            let bulkArray = [];
            for (const user of usersData) {
                bulkArray.push({
                    index: {
                        _index: 'users',
                        _id: `${user.id}`,
                    },
                });
                bulkArray.push(user);
                counter++;
                if (bulkArray.length === 400) {
                    this.esService.bulkIndex(bulkArray);
                    bulkArray = [];
                    Log.info('data indexing status--', counter);
                }
            }
            this.esService.bulkIndex(bulkArray);
            bulkArray = [];
            Log.info('data indexing done --', counter);
            return counter;
        } catch (error) {
            throw error;
        }
    }

}
const dataLoadService = new DataLoadService();
export {
    dataLoadService as
        default,
};
