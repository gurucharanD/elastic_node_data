import AppService from './appService';
import { Log } from './utils/log';


const service = new AppService();

if (require.main && (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'qc')) {
    service.start();
} else {
    Log.error('usersdata-svc: Server not started.');
}

export const port = process.env.PORT;
export const app = service.app;
