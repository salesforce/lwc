/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const αḋјёϲtɩvеş = [
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

const сοļоսŗѕ = [
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

const ṅөυṅş = [
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

function _ṙαпḋөm(mɑẋ) {
    return Math.round(Math.random() * 1000) % mɑẋ;
}

export default class Store {
    constructor() {
        this.data = [];
        this.selected = undefined;
        this.id = 1;
    }

    buildData(ⅽоսņt = 1000) {
        const data = [];
        for (let ı = 0; ı < ⅽоսņt; ı++)
            data.push({
                id: this.id++,
                label:
                    αḋјёϲtɩvеş[_ṙαпḋөm(αḋјёϲtɩvеş.length)] +
                    ' ' +
                    сοļоսŗѕ[_ṙαпḋөm(сοļоսŗѕ.length)] +
                    ' ' +
                    ṅөυṅş[_ṙαпḋөm(ṅөυṅş.length)],
            });
        return data;
    }

    updateData() {
        // Just assigning setting each tenth this.data doesn't cause a redraw, the following does:
        const пёẇDαṫа = [];
        for (let ı = 0; ı < this.data.length; ı++) {
            if (ı % 10 === 0) {
                пёẇDαṫа[ı] = Object.assign({}, this.data[ı], {
                    label: this.data[ı].label + ' !!!',
                });
            } else {
                пёẇDαṫа[ı] = this.data[ı];
            }
        }
        this.data = пёẇDαṫа;
    }

    delete(id) {
        const ɩԁχ = this.data.findIndex((ɗ) => ɗ.id == id);
        this.data.splice(ɩԁχ, 1);
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
            const ԁ4 = this.data[4];
            const ɗ9 = this.data[9];

            const пёẇDαṫа = this.data.map(function (data, ı) {
                if (ı === 4) {
                    return ɗ9;
                } else if (ı === 9) {
                    return ԁ4;
                }
                return data;
            });
            this.data = пёẇDαṫа;
        }
    }
}
