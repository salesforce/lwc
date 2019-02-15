/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';

declare var global: Global;

interface Global {
    performance: UserTiming;
}

interface UserTiming {
    mark(name: string): void;
    measure(label: string, name: string): void;
    clearMarks(name: string): void;
    clearMeasures(label: string): void;
}

interface Mark {
    name: string;
    label: null | string;
    children: Mark[];
    parent: Mark;
}

class FlameChart {
    activeMark: Mark;

    constructor() {
        this.reset();
    }

    reset() {
        this.activeMark = {
            name: '<ROOT>',
            label: '<ROOT>',
            children: [],
            parent: null,
        } as any;
    }

    injectPolyfill() {
        Object.assign(global.performance, {
            mark: (name: string) => {
                const mark: Mark = {
                    name,
                    label: null,
                    children: [],
                    parent: this.activeMark,
                };

                if (this.activeMark) {
                    this.activeMark.children.push(mark);
                }

                this.activeMark = mark;
            },

            measure: (label: string, mark: string) => {
                if (!this.activeMark) {
                    throw new Error(`Unexpected measure ${label}, no matching mark for ${mark}`);
                } else if (this.activeMark.name !== mark) {
                    throw new Error(`Unexpected measure ${label}, expected ${this.activeMark.name} received ${mark}`);
                }

                this.activeMark.label = label;
                this.activeMark = this.activeMark.parent;
            },

            clearMarks: () => {},

            clearMeasures: () => {},
        });
    }

    buildFlamechart(
        mark: Mark = this.activeMark,
        indent: number = 0
    ): string {
        return [
            '\t'.repeat(indent) + mark.label,
            ...mark.children.map(c => this.buildFlamechart(c, indent + 1)),
        ].join('\n');
    }

    toString() {
        return this.buildFlamechart();
    }
}

// TODO: Those test have are not exercising the expected logic.
// https://github.com/salesforce/lwc/commit/9cd09d41bc50907b2ee6f9ada3467a0de237db81#diff-b6e048115546dca1a7c9a1585e9b7a0c
describe.skip('performance-timing', () => {
    let createElement: any;
    let registerTemplate: any;
    let LightningElement: any;
    let flamechart: FlameChart;

    beforeEach(() => {
        // Make sure to reset module cache between each test to ensure to reset the uid.
        jest.resetModules();

        flamechart = new FlameChart();
        flamechart.injectPolyfill();

        const lwc = require('../main.ts');
        createElement = lwc.createElement;
        LightningElement = lwc.LightningElement;
        registerTemplate = lwc.registerTemplate;
    });

    it('captures component constructor', () => {
        class Foo extends LightningElement {}

        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);

        expect(flamechart.toString()).toMatchSnapshot();
    });

    it('captures all lifecycle hooks', () => {
        class Foo extends LightningElement {
            connectedCallback() {}
            renderedCallback() {}
            disconnectedCallback() {}
        }

        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);
        document.body.removeChild(elm);

        expect(flamechart.toString()).toMatchSnapshot();
    });

    it('captures nested component tree', () => {
        const barTmpl = compileTemplate(`<template>{foo}<span></span></template>`);
        class Bar extends LightningElement {
            render() {
                return registerTemplate(barTmpl);
            }
        }

        const fooTmpl = compileTemplate(`
            <template>
                <x-bar></x-bar>
                <x-bar></x-bar>
            </template>
        `, {
            modules: {
                'x-bar': Bar,
            }
        });
        class Foo extends LightningElement {
            render() {
                return registerTemplate(fooTmpl);
            }
        }

        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);

        expect(flamechart.toString()).toMatchSnapshot();
    });

    it('recovers from errors', () => {
        class Foo extends LightningElement {
            render() {
                throw new Error('Nooo!');
            }
        }

        const elm = createElement('x-foo', { is: Foo });

        try {
            document.body.appendChild(elm);
        } catch (err) {
            expect(err.message).toBe('Nooo!');
        }

        expect(flamechart.toString()).toMatchSnapshot();
    });

    it('captures error callback', () => {
        class Bar extends LightningElement {
            render() {
                throw new Error('Noo!');
            }
        }

        const fooTmpl = compileTemplate(`
            <template>
                <x-bar></x-bar>
            </template>
        `, {
            modules: {
                'x-bar': Bar,
            }
        });
        class Foo extends LightningElement {
            render() {
                return registerTemplate(fooTmpl);
            }
            errorCallback() {}
        }

        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);

        expect(flamechart.toString()).toMatchSnapshot();
    });

    it('skips parent measurement when children component props change', () => {
        let bar: Bar;
        let baz: Baz;

        const barTmpl = compileTemplate(`<template>{state}</template>`);
        class Bar extends LightningElement {
            state: boolean = false;

            connectedCallback() {
                bar = this;
            }

            render() {
                return registerTemplate(barTmpl);
            }

            static track = {
                state: {}
            };
        }

        const bazTmpl = compileTemplate(`<template>{state}</template>`);
        class Baz extends LightningElement {
            state: boolean = false;

            connectedCallback() {
                baz = this;
            }

            render() {
                return registerTemplate(bazTmpl);
            }

            static track = {
                state: {}
            };
        }

        const fooTmpl = compileTemplate(`
            <template>
                <x-bar></x-bar>
                <x-baz></x-baz>
            </template>
        `, {
            modules: {
                'x-bar': Bar,
                'x-baz': Baz,
            }
        });
        class Foo extends LightningElement {
            render() {
                return registerTemplate(fooTmpl);
            }
        }

        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);

        flamechart.reset();

        bar.state = true;
        baz.state = true;

        return Promise.resolve().then(() => (
            expect(flamechart.toString()).toMatchSnapshot()
        ));
    });
});
