import { createElement } from 'engine';
import Table from 'benchmark-table';
import { Store } from '../../table-store';
import { nextFrame } from '../../utils';

const tableName = 'benchmark-table';

const insertTableComponent = function() {
    return new Promise((resolve) => {
        const tableElement = createElement(tableName, { is: Table });
        document.body.appendChild(tableElement);
        nextFrame(() => {
            resolve(tableElement);
        });
    });
}

benchmark(`${tableName}/create/1k`, () => {
    let tableElement;

    before(async () => {
        tableElement = await insertTableComponent();
    });

    run(() => {
        const store = new Store();
        store.run();
        tableElement.rows = store.data;
    });
});
