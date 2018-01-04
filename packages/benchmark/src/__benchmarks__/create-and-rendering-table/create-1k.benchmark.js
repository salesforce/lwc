import { createElement } from 'engine';
import Table from 'benchmark-table';
import { Store } from '../../table-store';
import { insertTableComponent, destroyTableComponent } from '../../utils';

const tableName = 'benchmark-table';

benchmark(`${tableName}/create/1k`, () => {
    let tableElement;
    before(() => {
        tableElement = createElement(tableName, { is: Table });
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
