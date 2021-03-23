// Copyright (C) 2018 Berkadia Commercial Mortgage, LLC - All Rights Reserved

import express from 'express';
import bodyParser from 'body-parser';
import Boom from 'express-boom';
import { Router } from './routes';
import { dbBootstrap, esMigrations } from './db';
import { Log, LogMiddleware } from './utils/log';
import cors from 'cors';
import compression from 'compression';
import dataLoadService from './services/dataLoadingService';

class AppService {

  public dbBootstraped = false;
  public esMigrated = false;
  public app: any;
  public port: string;
  public env: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.env = process.env.NODE_ENV;
    this.initializeApp();
  }

  public initializeApp() {
    Log.info('Initializing usersdata-svc');
    this.app.set('HEALTH_STATUS', 'INITIALIZING');
    this.app.use(bodyParser.json());
    this.app.use(Boom());
    this.app.use(LogMiddleware);
    this.app.use(cors());
    this.app.use(compression({
      filter: this.shouldCompress,
      level: 9,
    }));

    Router.build(this.app);
  }

  public async initDB() {
    try {
      Log.info('Initializing dbBootstrap');
      await dbBootstrap.run();
      Log.info('dbBootstrap sucessful and migrations ran');
      this.dbBootstraped = true;
    } catch (e) {
      Log.child({
        message: e.message,
        stack: e.stack,
      }).error('Error bootstraping the database.');
      this.app.set('HEALTH_STATUS', 'DB_MIGRATION_FAILED');
      return Promise.reject(e);
    }
  }

  public async initESMigrations() {
    try {
      Log.info('Initializing initESMigrations');
      await esMigrations.run();
      this.esMigrated = true;
      Log.info('Completed initESMigrations');
    } catch (e) {
      Log.child({
        message: e.message,
        stack: e.stack,
      }).error('Error bootstraping the eSMigrations.');
      this.app.set('HEALTH_STATUS', 'ES_MIGRATION_FAILED');
      return Promise.reject(e);
    }
  }


  public init() {
    Log.info('Initializing usersdata-app');
    // this.app = this.initializeApp();
    const {
      PORT,
      NODE_ENV,
    } = process.env;

    // ENV Argument Checks
    if (!PORT || !NODE_ENV) {
      const msg =
        'Configuration Error: you must specify these ENV variables: PORT, NODE_ENV';
      Log.error(msg);
      throw new Error(msg);
    }

    this.port = PORT;
    this.env = NODE_ENV;
  }

  // eslint-disable-next-line complexity


  public async start() {
    const DOCKER_HOST = '0.0.0.0';

    this.app.listen(this.port, DOCKER_HOST, (err) => {
      if (err) {
        this.app.set('HEALTH_STATUS', 'SERVER_LISTEN_FAILED');
        throw err;
      }

      Log.info(`Server started on http://${DOCKER_HOST}:${this.port}`);
    });

    if (!this.esMigrated) {
      await this.initESMigrations();
      await dataLoadService.bulkIndexData();
    }

    if (!this.dbBootstraped) {
      await this.initDB();
    }

    if (this.env === 'development' || this.env === 'testing' || this.env === 'test') {
      process.env.isAppReadyForTest = 'true';
    }

    this.app.set('HEALTH_STATUS', 'READY');
    Log.info('Initialization successful. Service is Ready.');

    // Shutdown Hook
    process.on('SIGTERM', () => {
      this.stop();
    });
    process.on('unhandledRejection', (e: any) => {
      Log.child({
        message: e.message,
        stack: e.stack,
      }).error('Error due to unhandledRejection.');
    });

    Log.info('usersdata-svc: Server started!');
    return Promise.resolve();
  }

  /**
   * Closes the connection and exits with status code 0 after 3000 ms.
   * Sets HEALTH_STATUS to SHUTTING_DOWN while in progress
   *
   * @memberof Service
   */
  public stop() {
    Log.info('Starting graceful shutdown...');
    this.app.set('HEALTH_STATUS', 'SHUTTING_DOWN');

    // LoadingDock.readShutdown();

    setTimeout(() => {
      this.app.close(() => {
        Log.info('Shutdown Complete.');
        process.exit(0);
      });
    }, 3000);
  }

  public shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header
      return false;
    }
    // fallback to standard filter function
    return compression.filter(req, res);
  }
}

export default AppService;

// export const Server = new Service();
// // Start the service when run from command line
// if (
//   require.main &&
//   (process.env.NODE_ENV === 'production' ||
//     process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'qc')
// ) {
//   Log.info('usersdata-app: Server started');
//   Server.start();
// } else {
//   Log.error('usersdata-app: Server not started.');
// }
