import knex from './knex';
import bookshelf from 'bookshelf';
import jsonColumns from 'bookshelf-json-columns';

const _bookshelf = bookshelf(knex);
_bookshelf.plugin('pagination');
_bookshelf.plugin(jsonColumns);

export default _bookshelf;
