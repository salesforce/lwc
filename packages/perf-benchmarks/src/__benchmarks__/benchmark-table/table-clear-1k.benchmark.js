import { createElement } from 'lwc';
import Table from 'benchmark/table';

import { Store } from '../../tableStore';
import { insertTableComponent, destroyTableComponent } from '../../utils';

benchmark(`benchmark-table/clear/1k`, () => {
    let tableElement;
    let store;

    before(async () => {
        tableElement = createElement('benchmark-table', { is: Table });
        await insertTableComponent(tableElement);

        store = new Store();
        store.run();
        tableElement.rows = store.data;
    });

    run(() => {
        tableElement.rows = [];
    });

    after(() => {
        destroyTableComponent(tableElement);
    });
});
