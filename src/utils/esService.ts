import client from '../db/esclient';
import {
  Log,
} from './log';

export class ESService {

  public async checkExistingDataIndex(id, context, index, type) {

    let existingIndex = {};
    let indexBody = JSON.parse(JSON.stringify(context));
    try {
      existingIndex = await this.getESExists(index, type, id);
      if (existingIndex) {
        let existingIndexData: any;
        existingIndexData = await this.getESData(index, type, id);
        if (existingIndexData) {
          indexBody = {
            id,
            ...existingIndexData._source,
          };
        }
      }
      return indexBody;
    } catch (err) {
      Log.child({
        message: err.message,
        stack: err.stack,
      }).error('Error running checkExistingGridIndex. See Log.child.errorMessage.');

      return Promise.reject(err);
    }
  }

  public async getESData(index, type, id) {
    try {
      const getIndexData = await client.get({
        index,
        type,
        id,
      });
      return getIndexData;

    } catch (err) {
      Log.child({
        message: err.message,
        stack: err.stack,
      }).error('Error running getESData. See Log.child.errorMessage.');


      return Promise.reject(err);
    }
  }

  public async getESExists(index, type, id) {
    try {
      const existingIndex = await client.exists({
        index,
        type,
        id,
      });
      return existingIndex;

    } catch (err) {
      Log.child({
        message: err.message,
        stack: err.stack,
      }).error('Error running getESExists. See Log.child.errorMessage.');

      return Promise.reject(err);
    }
  }

  public prepareIndexData(index, type, id, body) {
    const data = {
      index,
      type,
      id,
      body,
    };

    return data;
  }

  public async indexDataArr(indexDataArr) {

    try {
      const results = [];
      for (const indexData of indexDataArr) {
        results.push(this.indexData(indexData));
      }
      await Promise.all(results);
    } catch (err) {
      Log.child({
        message: err.message,
        stack: err.stack,
      }).error('Error running indexDataArr . See Log.child.errorMessage.');

    }

  }

  public async indexData(indexData) {

    try {
      if (Object.entries(indexData).length === 0) {
        return null;
      } else {
        const result = await client.index(indexData);
        return result;
      }
    } catch (err) {
      Log.child({
        message: err.message,
        stack: err.stack,
      }).error(`Error running indexData for  ${indexData.index} and ${indexData.id} . See Log.child.errorMessage. ${err}`);
      return {};
    }

  }

  public async deleteIndex(index) {
    try {
      const result = await client.indices.delete({
        index,
      });
      return result.body;
    } catch (error) {
      throw error;
    }
  }

  public async deleteByQuery(index, query) {
    try {
      const result = await client.deleteByQuery(
        {
          index,
          body: query,
        },
      );
      return result.body;
    } catch (error) {
      Log.child({
        message: error.message,
        stack: error.stack,
      }).error('usersdata: Error in deleteByQuery');
      throw error;
    }
  }

  public async refreshIndex(index) {
    const result = await client.reindex(index);
    return result;
  }

  public async bulkIndex(bulkindexData) {
    try {
      const { body: bulkResponse } = await client.bulk({
        refresh: false,
        body: bulkindexData,
      });
      // console.log(JSON.stringify(bulkResponse, undefined, 2));
      if (bulkResponse.errors) {
        const erroredDocuments = [];
        bulkResponse.items.forEach((action, i) => {
          const operation = Object.keys(action)[0];
          if (action[operation].error) {
            erroredDocuments.push({
              status: action[operation].status,
              error: action[operation].error,
              operation: bulkindexData[i * 2],
            });
          }
        });
        Log.child({
          erroredDocuments,
        }).error('usersdata: bulkIndex erroredDocuments');
        return erroredDocuments;
      }
      return true;
    } catch (error) {
      Log.child({
        message: error.message,
        stack: error.stack,
      }).error('usersdata: Error in bulkIndex');
      return error;
    }
  }

  public async search(index, query) {
    try {
      const { body, statusCode } = await client.search({
        index,
        body: query,
      });

      if (statusCode === 200) {
        return body;
      }
    } catch (error) {
      Log.child({
        message: error.message,
        stack: error.stack,
      }).error('usersdata: Error in ES search', query);
      return error;
    }
  }

  public async searchAndFilterHits(index, query) {
    try {
      const { body } = await client.search({
        index,
        body: query,
      });
      return body.hits.hits.map((x) => x._source);
    } catch (error) {
      Log.child({
        message: error.message,
        stack: error.stack,
      }).error('usersdata: Error in ES search');
      return error;
    }
  }

  public async getSchema(index) {
    try {
      return await new Promise((resolve, reject) => {
        client.indices.getMapping({ index }, (error, data) => {
          resolve(data);
        });
      });
    } catch (error) {
      return error;
    }
  }

  public async updateByQuery(index, type, body) {
    try {
      return await client.updateByQuery({
        index,
        type,
        body,
      });
    } catch (error) {
      return error;
    }
  }

  public async multiQuery([...queries]) {
    try {
      const { body } = await client.msearch({
        body: queries,
      });
      return body.responses;
    } catch (err) {
      Log.error('error in multiQuery', err);
      return err;
    }
  }
}

export default ESService;
