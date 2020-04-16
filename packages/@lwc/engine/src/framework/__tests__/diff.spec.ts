/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement, registerDecorators } from '../main';

const adjectives = [
    'pretty',
    'large',
    'big',
    'small',
    'tall',
    'short',
    'long',
    'handsome',
    'plain',
    'quaint',
    'clean',
    'elegant',
    'easy',
    'angry',
    'crazy',
    'helpful',
    'mushy',
    'odd',
    'unsightly',
    'adorable',
    'important',
    'inexpensive',
    'cheap',
    'expensive',
    'fancy',
];

const colours = [
    'red',
    'yellow',
    'blue',
    'green',
    'pink',
    'brown',
    'purple',
    'brown',
    'white',
    'black',
    'orange',
];

const nouns = [
    'table',
    'chair',
    'house',
    'bbq',
    'desk',
    'car',
    'pony',
    'cookie',
    'sandwich',
    'burger',
    'pizza',
    'mouse',
    'keyboard',
];

function _random(max) {
    return Math.round(Math.random() * 1000) % max;
}

class Store {
    constructor() {
        this.data = [];
        this.selected = undefined;
        this.id = 1;
    }

    buildData(count = 1000) {
        const data = [];
        for (var i = 0; i < count; i++) {
            data.push({
                id: this.id++,
                label:
                    adjectives[_random(adjectives.length)] +
                    ' ' +
                    colours[_random(colours.length)] +
                    ' ' +
                    nouns[_random(nouns.length)],
            });
        }
        return data;
    }

    updateData() {
        // Just assigning setting each tenth this.data doesn't cause a redraw, the following does:
        const newData = [];
        for (let i = 0; i < this.data.length; i++) {
            if (i % 10 === 0) {
                newData[i] = Object.assign({}, this.data[i], {
                    label: this.data[i].label + ' !!!',
                });
            } else {
                newData[i] = this.data[i];
            }
        }
        this.data = newData;
    }

    delete(id) {
        const idx = this.data.findIndex((d) => d.id == id);
        this.data.splice(idx, 1);
    }

    run() {
        this.data = this.buildData();
        this.selected = undefined;
    }

    add() {
        this.data = this.data.concat(this.buildData(1000));
    }

    update() {
        this.updateData();
    }

    select(id) {
        this.selected = id;
    }

    runLots() {
        this.data = this.buildData(10000);
        this.selected = undefined;
    }

    clear() {
        this.data = [];
        this.selected = undefined;
    }

    swapRows() {
        if (this.data.length > 10) {
            const d4 = this.data[4];
            const d9 = this.data[9];

            const newData = this.data.map(function (data, i) {
                if (i === 4) {
                    return d9;
                } else if (i === 9) {
                    return d4;
                }
                return data;
            });
            this.data = newData;
        }
    }
}

class Table extends LightningElement {
    render() {
        return tableHTML;
    }
}
registerDecorators(Table, {
    publicProps: { rows: {} },
});

class Row extends LightningElement {
    render() {
        return rowHTML;
    }
}
registerDecorators(Row, {
    publicProps: { row: {} },
});

const rowHTML = compileTemplate(
    `
    <template>
        <span>{row.id}</span>
        <div><a data-id={row.id}>{row.label}</a></div>
        <div><a data-id={row.id}>Remove</a></div>
    </template>
    `,
    { modules: {} }
);

const tableHTML = compileTemplate(
    `
    <template>
        <section>
            <div>
                <template for:each={rows} for:item="row">
                    <x-row
                        key={row.id}
                        class={row.className}
                        row={row}
                    >
                    </x-row>
                </template>
            </div>
        </section>
    </template>
    `,
    {
        modules: {
            'x-row': Row,
        },
    }
);

describe('diff algo', () => {
    describe('iteration', () => {
        it('should create new items', () => {
            const store = new Store();
            const elm = createElement('x-table', { is: Table });
            store.run();
            elm.rows = store.data;
            document.body.appendChild(elm);
            const template = elm.shadowRoot;
            expect(template.querySelectorAll('x-row').length).toBe(1000);
        });
        it('should append new items', () => {
            const store = new Store();
            const elm = createElement('x-table', { is: Table });
            store.run();
            elm.rows = store.data;
            document.body.appendChild(elm);
            store.add();
            const template = elm.shadowRoot;
            const [e1, e2, e3] = template.querySelectorAll('x-row');
            elm.rows = store.data;
            return Promise.resolve().then(() => {
                expect(template.querySelectorAll('x-row').length).toBe(2000);
                const [r1, r2, r3] = template.querySelectorAll('x-row');
                expect(r1).toBe(e1);
                expect(r2).toBe(e2);
                expect(r3).toBe(e3);
            });
        });
        it('should allow swapping', () => {
            const store = new Store();
            const elm = createElement('x-table', { is: Table });
            store.run();
            const [a, b, c] = store.data;
            elm.rows = [a, b, c];
            document.body.appendChild(elm);
            const template = elm.shadowRoot;
            const e = template.querySelectorAll('x-row');
            elm.rows = [a, c, b];
            return Promise.resolve().then(() => {
                expect(template.querySelectorAll('x-row').length).toBe(3);
                const r = template.querySelectorAll('x-row');
                expect(r[1]).toBe(e[2]);
                expect(r[2]).toBe(e[1]);
            });
        });
        it('should allow reusing the first element as last', () => {
            const store = new Store();
            const elm = createElement('x-table', { is: Table });
            store.run();
            const [a, b, c] = store.data;
            elm.rows = [a, b, c];
            document.body.appendChild(elm);
            const template = elm.shadowRoot;
            const [e1, e2, e3] = template.querySelectorAll('x-row');
            elm.rows = [c, b, a];
            return Promise.resolve().then(() => {
                expect(template.querySelectorAll('x-row').length).toBe(3);
                const [r1, r2, r3] = template.querySelectorAll('x-row');
                expect(r1).toBe(e3);
                expect(r2).toBe(e2);
                expect(r3).toBe(e1);
            });
        });
        it('should allow removing last and add new at the end', () => {
            const store = new Store();
            const elm = createElement('x-table', { is: Table });
            store.run();
            const [a, b, c, d] = store.data;
            elm.rows = [a, b, c];
            document.body.appendChild(elm);
            const template = elm.shadowRoot;
            const e = template.querySelectorAll('x-row');
            elm.rows = [c, b, d];
            return Promise.resolve().then(() => {
                expect(template.querySelectorAll('x-row').length).toBe(3);
                const r = template.querySelectorAll('x-row');
                expect(r[1]).toBe(e[1]);
                expect(r[0]).toBe(e[2]);
            });
        });
        it('should allow pulldown to refresh', () => {
            const store = new Store();
            const elm = createElement('x-table', { is: Table });
            store.run();
            const [a, b, c, d] = store.data;
            elm.rows = [c, d];
            document.body.appendChild(elm);
            const template = elm.shadowRoot;
            const [e1, e2] = template.querySelectorAll('x-row');
            elm.rows = [a, b, c, d]; // inserting new items first
            return Promise.resolve().then(() => {
                expect(template.querySelectorAll('x-row').length).toBe(4);
                const r = template.querySelectorAll('x-row');
                expect(r[2]).toBe(e1);
                expect(r[3]).toBe(e2);
            });
        });
        it('should allow pagination', () => {
            const store = new Store();
            const elm = createElement('x-table', { is: Table });
            store.run();
            const [a, b, c, d] = store.data;
            elm.rows = [a, b];
            document.body.appendChild(elm);
            const template = elm.shadowRoot;
            const [e1, e2] = template.querySelectorAll('x-row');
            elm.rows = [a, b, c, d]; // inserting new items at the end
            return Promise.resolve().then(() => {
                expect(template.querySelectorAll('x-row').length).toBe(4);
                const r = template.querySelectorAll('x-row');
                expect(r[0]).toBe(e1);
                expect(r[1]).toBe(e2);
            });
        });
    });
    describe('patching', () => {
        it('should not patch elements twice', () => {
            const tableHTML = compileTemplate(`<template>
                <table>
                    <template for:each={items} for:item="item">
                        <tr key={item.id}>
                            <td>{item.value}</td>
                        </tr>
                    </template>
                </table>
            </template>`);
            class App extends LightningElement {
                items = [
                    { id: 'a', value: 5 },
                    { id: 'b', value: 4 },
                    { id: 'c', value: 1 },
                    { id: 'd', value: 3 },
                ];
                sortDir = 'ASC';
                sort(dir) {
                    const clone = Array.from(this.items);
                    this.sortDir = dir;
                    clone.sort((a, b) => {
                        if (this.sortDir === 'DESC') {
                            return b.value - a.value;
                        }
                        return a.value - b.value;
                    });
                    this.items = clone;
                }
                render() {
                    return tableHTML;
                }
            }
            registerDecorators(App, {
                track: { items: 1, sortDir: 1 },
                publicMethods: ['sort'],
            });
            const elm = createElement('x-foo', { is: App });
            document.body.appendChild(elm);
            expect(elm.shadowRoot.textContent).toBe('5413');
            elm.sort('DESC');
            return Promise.resolve().then(() => {
                expect(elm.shadowRoot.textContent).toBe('5431');
                elm.sort('ASC');
                return Promise.resolve().then(() => {
                    expect(elm.shadowRoot.textContent).toBe('1345');
                });
            });
        });
    });
});
