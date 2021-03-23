import {
    Log
} from '../../utils/log';
import dataLoadService from '../../services/dataLoadingService';

exports.up = async function up(knex, Promise) {
    try {
        Log.info('running Migrarions 20210322_load_data');
        await dataLoadService.bulkIndexData();
        return true
    } catch (error) {
        Log.info('Error running Migrarions 20210322_load_data. See Log.child.errorMessage ');
        Log.child({ message: error.message, stack: error.stack }).info('Error running for 20210322_load_data. See Log.child.errorMessage.');
    }
};

exports.down = async function down(knex, Promise) {
    return true
};
