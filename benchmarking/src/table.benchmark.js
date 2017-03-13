import { createElement } from 'raptor-engine';
import { benchmark } from 'runner';

import Table from 'benchmark:table';
import TableComponent from 'benchmark:table-component';

import { Store } from './table-store';
import {
    assertElement,
    assertText,
    nextFrame,
    nextTick
} from './utils';

let tableElement;
let store;

for (let TableClass of [Table, TableComponent]) {
    const insertTableComponent = function(cb) {
        if (!tableElement) {
            tableElement = createElement(TableClass.tagName, { is: TableClass });
            document.body.appendChild(tableElement);
        }

        nextFrame(cb);
    }

    benchmark({
        name: `${TableClass.tagName}/create/1k`,
        description: 'Duration for create 1k rows',
        before(cb) {
            insertTableComponent(() => {
                tableElement.rows = [];
                nextFrame(cb);
            });
        },
        run(cb) {
            store = new Store();
            store.run();

            tableElement.rows = store.data;
            nextTick(cb);
        },
        after(cb) {
            assertElement('tbody > tr:nth-child(1000) > td:nth-child(2) > a');
            nextFrame(cb);
        }
    });

    benchmark({
        name: `${TableClass.tagName}/update10th/1k`,
        description: 'Duration to update every 10th rows',
        before(cb) {
            insertTableComponent(() => {
                store = new Store();
                store.run();

                tableElement.rows = store.data;
                nextFrame(cb);
            });
        },
        run(cb) {
            store.update();

            tableElement.rows = store.data;
            nextTick(cb);
        },
        after(cb) {
            assertText('tbody > tr:first-child > td:nth-child(2) > a', '!!!');
            nextFrame(cb);
        }
    });

    benchmark({
        name: `${TableClass.tagName}/create/10k`,
        description: 'Duration for create 10k rows',
        before(cb) {
            insertTableComponent(() => {
                tableElement.rows = [];
                nextFrame(cb);
            });
        },
        run(cb) {
            store = new Store();
            store.runLots();

            tableElement.rows = store.data;
            nextTick(cb);
        },
        after(cb) {
            assertElement('tbody > tr:nth-child(10000) > td:nth-child(2) > a');
            nextFrame(cb);
        }
    });

    benchmark({
        name: `${TableClass.tagName}/append/1k`,
        description: 'Duration for appending 1k row to 10k existing rows',
        before(cb) {
            insertTableComponent(() => {
                store = new Store();
                store.runLots();

                tableElement.rows = store.data;
                nextFrame(cb);
            });
        },
        run(cb) {
            store.add();

            tableElement.rows = store.data;
            nextTick(cb);
        },
        after(cb) {
            assertElement('tbody > tr:nth-child(11000) > td:nth-child(2) > a');
            nextFrame(cb);
        }
    });

    benchmark({
        name: `${TableClass.tagName}/clear/10k`,
        description: 'Duration for clearing 10k rows',
        before(cb) {
            insertTableComponent(() => {
                store = new Store();
                store.runLots();

                tableElement.rows = store.data;
                nextFrame(cb);
            });
        },
        run(cb) {
            tableElement = [];
            nextTick(cb);
        },
    });
}
