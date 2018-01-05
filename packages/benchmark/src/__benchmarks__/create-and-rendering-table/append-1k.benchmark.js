import { createElement } from 'engine';
import Table from 'benchmark-table';
import { Store } from '../../table-store';
import { insertTableComponent, destroyTableComponent } from '../../utils';

const tableName = 'benchmark-table';

benchmark(`${tableName}/add/1k`, () => {
    let tableElement;
    let store;

    before(async () => {
        tableElement = createElement(tableName, { is: Table });
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
