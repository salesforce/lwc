import * as Raptor from 'raptor-engine';
import { benchmark } from 'runner';

import Table from 'benchmark:table';
import { assertElement } from './utils';

const tableElement = Raptor.createElement(Table.tagName, { is: Table });
document.body.appendChild(tableElement);

benchmark({
    name: 'table/create/1k',
    description: 'Duration for create 1k rows',
    run(cb) {
        tableElement.add();
        return Promise.resolve().then(cb);
    },
    after(cb) {
        assertElement('tbody > tr:nth-child(1000) > td:nth-child(2) > a');
        tableElement.clear();
        setTimeout(cb, 0);
    }
});

// benchmark({
//     name: 'table/replace/1k',
//     description: 'Duration to update 1k rows',
//     run(cb) {
//         tableElement.run();
//         return Promise.resolve().then(cb);
//     },
//     after(cb) {
//         assertElement('tbody > tr:nth-child(1000) > td:nth-child(2) > a');
//         tableElement.clear();
//         setTimeout(cb, 0);
//     }
// });

// benchmark({
//     name: 'table/replace/1k',
//     description: 'Duration to update 1k rows',
//     run(cb) {
//         tableElement.run();
//         return Promise.resolve().then(cb);
//     },
//     after(cb) {
//         assertElement('tbody > tr:nth-child(1000) > td:nth-child(2) > a');
//         tableElement.clear();
//         setTimeout(cb, 0);
//     }
// });

// benchmark({
//     name: 'table/update10th/1k',
//     description: 'Duration to update every 10th rows',
//     run(cb) {
//         tableElement.update();
//         return Promise.resolve().then(cb);
//     }
// });

// benchmark({
//     name: 'table/create/10k',
//     description: 'Duration for create 10k rows',
//     run(cb) {
//         tableElement.runLots();
//         return Promise.resolve().then(cb);
//     },
//     after(cb) {
//         tableElement.clear();
//         setTimeout(cb, 0);
//     }
// });

// benchmark({
//     name: 'table/append/1k',
//     description: 'Duration for appending 1k row to 10k existing rows',
//     before(cb) {
//         tableElement.runLots();
//         setTimeout(cb, 0);
//     },
//     run(cb) {
//         tableElement.add();
//         return Promise.resolve().then(cb);
//     },
// });

// benchmark({
//     name: 'table/clear/1k',
//     description: 'Duration for clearing 10k rows',
//     before(cb) {
//         tableElement.runLots();
//         setTimeout(cb, 0);
//     },
//     run(cb) {
//         tableElement.clear();
//         return Promise.resolve().then(cb);
//     },
// });
