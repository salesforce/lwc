import { createElement, Element } from 'engine';
import Table from 'benchmark-table';

import { Store } from '../../table-store';
import { insertTableComponent, destroyTableComponent } from '../../utils';
import { wrapEngine } from '../../aura-locker';

benchmark(`benchmark-table/create/10k`, () => {
    let tableElement;
    const key = { namespace: 'key' };
    const SecureEngine = wrapEngine({ Element }, key); 

    before(() => {
        Reflect.setPrototypeOf(Table, SecureEngine.Element);
        tableElement = createElement('benchmark-table', { is:Table });
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
