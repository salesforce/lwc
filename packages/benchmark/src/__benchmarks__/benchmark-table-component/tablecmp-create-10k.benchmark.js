import { createElement } from 'engine';
import Table from 'benchmark-table-component';

import { Store } from '../../table-store';
import { insertTableComponent, destroyTableComponent } from '../../utils';

benchmark(`benchmark-table-component/create/10k`, () => {
    let tableElement;

    before(() => {
        tableElement = createElement('benchmark-table-component', { is: Table });
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
