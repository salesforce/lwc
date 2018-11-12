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
        const knownMarks = new Set<string>();
        const knownMeasures = new Set<string>();

        global.performance = {
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

            // tslint:disable-next-line:no-empty
            clearMarks(name: string): void {},

            // tslint:disable-next-line:no-empty
            clearMeasures(name: string): void {},
        };
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

describe('performance-timing', () => {
    let createElement: any;
    let registerTemplate: any;
    let LightningElement: any;
    let flamechart: FlameChart;

    beforeEach(() => {
        // Make sure to reset module cache between each test to ensure to reset the uid.
        jest.resetModules();
        createElement = require('../main.ts').createElement;
        LightningElement = require('../main.ts').LightningElement;
        registerTemplate = require('../main.ts').registerTemplate;
        flamechart = new FlameChart();
        flamechart.injectPolyfill();
    });

    it('captures component constructor', () => {
        class Foo extends LightningElement {}

        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);

        expect(flamechart.toString()).toMatchSnapshot();
    });

    it('captures all lifecycle hooks', () => {
        class Foo extends LightningElement {
            // tslint:disable-next-line:no-empty
            connectedCallback() {}

            // tslint:disable-next-line:no-empty
            renderedCallback() {}

            // tslint:disable-next-line:no-empty
            disconnectedCallback() {}
        }

        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);
        document.body.removeChild(elm);

        expect(flamechart.toString()).toMatchSnapshot();
    });

    it('captures nested component tree', () => {
        const barTmpl = compileTemplate(`<template><span></span></template>`);
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

            // tslint:disable-next-line:no-empty
            errorCallback() {}
        }

        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);

        expect(flamechart.toString()).toMatchSnapshot();
    });

    it('skips parent measurement when children component props change', () => {
        let bar: Bar;
        let baz: Baz;

        debugger;
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
