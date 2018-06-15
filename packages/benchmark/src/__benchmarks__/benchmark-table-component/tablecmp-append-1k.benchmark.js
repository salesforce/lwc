import { createElement } from 'engine';
import Table from 'benchmark-table-component';

import { Store } from '../../table-store';
import { insertTableComponent, destroyTableComponent } from '../../utils';

benchmark(`benchmark-table-component/append/1k`, () => {
    let tableElement;
    let store;

    before(async () => {
        tableElement = createElement('benchmark-table-component', { is: Table, fallback: false });
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
