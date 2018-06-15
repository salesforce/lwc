import { createElement } from 'engine';
import Table from 'benchmark-table';

import { Store } from '../../table-store';
import { insertTableComponent, destroyTableComponent } from '../../utils';

benchmark(`benchmark-table/create/10k`, () => {
    let tableElement;

    before(() => {
        tableElement = createElement('benchmark-table', { is:Table, fallback: false });
        return insertTableComponent(tableElement);
    });

    run(() => {
        const store = new Store();
        store.runLots();
        tableElement.rows = store.data;
    });

    after(() => {
        destroyTableComponent(tableElement);
    });
});
