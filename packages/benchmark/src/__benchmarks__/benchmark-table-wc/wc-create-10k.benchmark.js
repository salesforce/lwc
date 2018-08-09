import { buildCustomElementConstructor } from 'lwc';
import Table from 'benchmark-table-component';
import Row from 'benchmark-table-component-row';

import { Store } from '../../table-store';
import { insertTableComponent, destroyTableComponent } from '../../utils';

customElements.define('benchmark-table-component', buildCustomElementConstructor(Table));
// the row can be optionally defined, but this benchmark always do it so we know how costly it is.
customElements.define('benchmark-table-component-row', buildCustomElementConstructor(Row));

benchmark(`benchmark-table-wc/create/10k`, () => {
    let tableElement;

    before(() => {
        tableElement = document.createElement('benchmark-table-component');
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
