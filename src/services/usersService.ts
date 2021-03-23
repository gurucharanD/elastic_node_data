import ESService from './../utils/esService';
import {
    Log,
} from '../utils/log';

class UsersService {
    public esService;

    constructor() {
        this.esService = new ESService();
    }

    public async addUser(user: {
        id: string,
        name: string,
        father_husband: string,
        address: string,
        age: number,
        gender: string
    }) {
        try {
            let dataObj = {
                "id": user.id ? user.id : '',
                "Name": user.name ? user.name : '',
                "Father/Husband": user.father_husband ? user.father_husband : '',
                "Address": user.address ? user.address : '',
                "Age": user.age ? user.age : 18,
                "Gender": user.gender ? user.gender : ''
            }
            let res = await this.esService.indexData({
                index: 'users',
                id: user.id,
                body: dataObj
            });
            return res;

        } catch (e) {
            Log.child('error in adding record').error(e);
            return e;
        }
    }

    public async searchUser(name) {
        try {
            let query = {
                "size": 9999,
                "query": {
                    "query_string": {
                        "query": `*${name}*`,
                        "fields": [
                            "Name"
                        ]
                    }
                }
            }
            let data = await this.esService.searchAndFilterHits('users', query);
            return data;
        } catch (e) {

        }
    }

    public async fetchAllUsers() {
        try {
            let query = {
                "size": 9999,
                "sort": [{
                    "Age": "asc"
                }]
            };
            let data = await this.esService.searchAndFilterHits('users', query);
            return data;
        } catch (e) {

        }
    }

}

const usersService = new UsersService();

export default usersService;
