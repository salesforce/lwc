import { createElement } from 'lwc';
import Table from 'benchmark/tableComponent';

import { Store } from '../../tableStore';
import { insertTableComponent, destroyTableComponent } from '../../utils';

benchmark(`benchmark-table-component/create/1k`, () => {
    let tableElement;

    before(() => {
        tableElement = createElement('benchmark-table-component', { is: Table });
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
