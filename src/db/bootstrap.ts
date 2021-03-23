// // Copyright (C) 2018 Berkadia Commercial Mortgage, LLC - All Rights Reserved
import knex from './knex';
import { Log } from '../utils/log';

export class Bootstrap {
    public async run() {
        Log.info('Migration lock removal response');
        try {
            await knex.transaction(async (trx) => {
                const lockRemovalResponse = await trx.raw(
                    'update usersdata_knex_migrations_lock set is_locked=0',
                );
                Log.info('Migration lock removal response', lockRemovalResponse);
            });
        } catch (ex) {
            Log.error('Migration lock removal exception', ex.message, ex);
        }
        await this.runMigrations();

        // await knex.transaction(async function (trx) {
        //     const migrations = await trx.raw('select name from usersdata_knex_migrations');
        //     Log.info('migrations', JSON.stringify(migrations[0], undefined, 2));
        // });

    }

    public async runMigrations() {
        try {
            Log.info('running migrations');
            // await knex.migrate.rollback(10);
            await knex.migrate.latest();
        } catch (err) {
            Log.error('running migrations failed.', err);
            throw err;
        }
    }

}

export const dbBootstrap = new Bootstrap();
