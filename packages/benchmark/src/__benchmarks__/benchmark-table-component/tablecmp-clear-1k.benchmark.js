import { createElement } from 'engine';
import Table from 'benchmark-table-component';

import { Store } from '../../table-store';
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
