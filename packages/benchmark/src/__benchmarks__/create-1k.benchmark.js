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
    benchmark(`${tagName}/create/1k`, () => {
        let tableElement;
        before(() => {
            tableElement = createElement(tagName, { is: tagNameMapping[tagName] });
            return insertTableComponent(tableElement);
        });

        run(() => {
            const store = new Store();
            store.run();
            tableElement.rows = store.data;
        });

        after(() => {
            destroyTableComponent(tableElement);
        });
    });
});
