import { createElement, Element } from 'engine';
import Table from 'benchmark-table-component';

import { Store } from '../../table-store';
import { insertTableComponent, destroyTableComponent } from '../../utils';
import { wrapEngine } from '../../aura-locker';

benchmark(`benchmark-table-component/create/1k`, () => {
    let tableElement;
    const key = { namespace: 'key' };
    const SecureEngine = wrapEngine({ Element }, key);    

    before(() => {
        Reflect.setPrototypeOf(Table, SecureEngine.Element);
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
