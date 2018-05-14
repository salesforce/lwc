import { createElement, Element } from 'engine';
import Table from 'benchmark-table-component';

import { Store } from '../../table-store';
import { insertTableComponent, destroyTableComponent } from '../../utils';
import { wrapEngine } from '../../aura-locker';

benchmark(`benchmark-table-component/update-10th/1k`, () => {
    let tableElement;
    let store;
    const key = { namespace: 'key' };
    const SecureEngine = wrapEngine({ Element }, key);    

    before(async () => {
        Reflect.setPrototypeOf(Table, SecureEngine.Element);
        tableElement = createElement('benchmark-table-component', { is: Table });
        await insertTableComponent(tableElement);

        store = new Store();
        store.run();
        tableElement.rows = store.data;
    });

    run(() => {
        store.update();
        tableElement.rows = store.data;
    });

    after(() => {
        destroyTableComponent(tableElement);
    });
});
