import Util from 'util';
import { Router } from 'express';
import Joi from 'joi';
import { Log } from '../utils/log';
import usersService from '../services/usersService';

const router = Router();

router.post('/add', async (req: any, res: any) => {
    const schema = Joi.object({
        id: Joi.string(),
        name: Joi.string(),
        father_husband: Joi.string(),
        address: Joi.string(),
        age: Joi.number().integer(),
        gender: Joi.string()
    });

    const payload = req.body;
    const result: any = schema.validate(payload);
    if (result.error) {
        Log.info(`Error encountered ${Util.inspect(result, { depth: null })}`);
        return res.boom.badData(result.error);
    }
    try {
        let response = await usersService.addUser(payload);
        res.send({
            response: response.statusCode
        })
    } catch (error) {
        res.boom.badData('error->', error);
    }
});

router.post('/search', async (req: any, res: any) => {
    const schema = Joi.object({
        name: Joi.string()
    });

    const payload = req.body;
    const result: any = schema.validate(payload);
    if (result.error) {
        Log.info(`Error encountered ${Util.inspect(result, { depth: null })}`);
        return res.boom.badData(result.error);
    }
    try {
        let response = await usersService.searchUser(payload.name);
        res.send({
            response
        })
    } catch (error) {
        res.boom.badData('error->', error);
    }
});

router.post('/fetchall', async (req: any, res: any) => {

    try {
        let response = await usersService.fetchAllUsers();
        res.send({
            response
        })
    } catch (error) {
        res.boom.badData('error->', error);
    }
});




module.exports = router;
