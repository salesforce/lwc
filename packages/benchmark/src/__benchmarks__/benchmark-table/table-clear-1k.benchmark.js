import { createElement, Element } from 'engine';
import Table from 'benchmark-table';

import { Store } from '../../table-store';
import { insertTableComponent, destroyTableComponent } from '../../utils';
import { wrapEngine } from '../../aura-locker';

benchmark(`benchmark-table/clear/1k`, () => {
    let tableElement;
    let store;
    const key = { namespace: 'key' };
    const SecureEngine = wrapEngine({ Element }, key);    
    
    before(async () => {
        Reflect.setPrototypeOf(Table, SecureEngine.Element);
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
