import { createElement } from 'lwc';
import Table from 'benchmark-table';

import { Store } from '../../table-store';
import { insertTableComponent, destroyTableComponent } from '../../utils';

benchmark(`benchmark-table/create/1k`, () => {
    let tableElement;

    before(() => {
        tableElement = createElement('benchmark-table', { is: Table });
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
