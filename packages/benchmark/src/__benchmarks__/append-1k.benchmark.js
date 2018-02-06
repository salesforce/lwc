import { createElement } from 'engine';
import Table from 'benchmark-table';
import TableComponent from 'benchmark-table-component';

import { Store } from '../table-store';
import { insertTableComponent, destroyTableComponent } from '../utils';

const tagNameMapping = {
    'benchmark-table': Table,
    'benchmark-table-component': TableComponent
};

Object.keys(tagNameMapping).forEach(tagName => {

    benchmark(`${tagName}/append/1k`, () => {
        let tableElement;
        let store;

        before(async () => {
            tableElement = createElement(tagName, { is: tagNameMapping[tagName] });
            await insertTableComponent(tableElement);

            store = new Store();
            store.run();
            tableElement.rows = store.data;
        });

        run(() => {
            store.add();
            tableElement.rows = store.data;
        });

        after(() => {
            destroyTableComponent(tableElement);
        });
    });
})
