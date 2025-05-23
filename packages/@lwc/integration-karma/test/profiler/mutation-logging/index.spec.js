import { createElement } from 'lwc';
import Parent from 'x/parent';
import Child from 'x/child';
import GetterThrows from 'x/getterThrows';

const arr = jasmine.arrayWithExactContents;
const obj = jasmine.objectContaining;

let entries = [];

beforeEach(() => {
    const perfMeasure = performance.measure.bind(performance);

    // We could use PerformanceObserver for this, but it's awkward and unreliable for unit testing
    // See: https://github.com/salesforce/lwc/issues/4600
    spyOn(performance, 'measure').and.callFake((...args) => {
        const entry = perfMeasure(...args);
        if (['lwc-render', 'lwc-rerender'].includes(entry.name)) {
            entries.push(entry);
        }
        return entry;
    });
});

afterEach(() => {
    entries = [];
});

function rerenderEntry(tagName, propString) {
    return obj({
        name: 'lwc-rerender',
        detail: obj({
            devtools: obj({
                properties: arr([
                    arr(['Component', `<${tagName}>`]),
                    arr([`<${tagName}>`, propString]),
                ]),
            }),
        }),
    });
}

function expectRerenderEntry(tagName, propString) {
    expect(entries).toEqual(arr([rerenderEntry(tagName, propString)]));
}

it.runIf(process.env.NODE_ENV === 'production')('No perf measures in prod mode', async () => {
    const elm = createElement('x-child', { is: Child });
    document.body.appendChild(elm);

    await new Promise(requestAnimationFrame);
    elm.firstName = 'Ferdinand';

    await new Promise(requestAnimationFrame);
    expect(entries).toEqual([]);
});

describe.skipIf(process.env.NODE_ENV === 'production')('Perf measures in dev mode', () => {
    // dev mode
    describe('basic', () => {
        let elm;

        beforeEach(async () => {
            elm = createElement('x-child', { is: Child });
            document.body.appendChild(elm);

            await new Promise(requestAnimationFrame);
            expect(entries).toEqual(arr([obj({ name: 'lwc-render' })]));
            entries = []; // reset
        });

        it('Does basic mutation logging', async () => {
            elm.firstName = 'Ferdinand';

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'firstName');
        });

        it('Logs subsequent mutations on the same component', async () => {
            elm.firstName = 'Ferdinand';

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'firstName');
            entries = []; // reset

            elm.lastName = 'Magellan';

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'lastName');
            entries = []; // reset

            elm.firstName = 'Vasco';
            elm.lastName = 'da Gama';

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'firstName, lastName');
        });

        it('Logs deep mutation on an object', async () => {
            elm.setPreviousName('first', 'Vancouver');

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'previousName.first');
        });

        it('Logs deep mutation on an object - characters requiring bracket member notation', async () => {
            elm.setPreviousNameFullName('George Vancouver');

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'previousName["full name"]');
        });

        it('Logs doubly-deep mutation on an object', async () => {
            elm.setPreviousNameSuffix('short', 'Jr.');

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'previousName.suffix.short');
        });

        it('Logs deep mutation on an array', async () => {
            elm.addAlias('Magellan');

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'aliases.length');
        });

        it('Logs deep mutation on an object within an array', async () => {
            elm.setFavoriteIceCreamFlavor('vanilla');

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'favoriteFlavors[0].flavor');
        });

        it('Logs multiple mutations on the same component', async () => {
            elm.firstName = 'Ferdinand';
            elm.setPreviousNameSuffix('short', 'Jr.');
            elm.setFavoriteIceCreamFlavor('vanilla');

            await new Promise(requestAnimationFrame);
            expectRerenderEntry(
                'x-child',
                'favoriteFlavors[0].flavor, firstName, previousName.suffix.short'
            );
        });

        it('Logs a component mutation while another component is rendered for the first time', async () => {
            const elm2 = createElement('x-child', { is: Child });
            document.body.appendChild(elm2);
            elm.firstName = 'Ferdinand';

            await new Promise(requestAnimationFrame);
            expect(entries).toEqual(
                arr([
                    obj({
                        name: 'lwc-render',
                    }),
                    rerenderEntry('x-child', 'firstName'),
                ])
            );
        });

        it('Logs two mutations on two instances of same component', async () => {
            const elm2 = createElement('x-child', { is: Child });
            document.body.appendChild(elm2);

            await new Promise(requestAnimationFrame);
            expect(entries).toEqual(
                arr([
                    obj({
                        name: 'lwc-render',
                    }),
                ])
            );
            entries = []; // reset

            elm.firstName = 'Marco';
            elm2.lastName = 'Polo';

            await new Promise(requestAnimationFrame);

            expect(entries).toEqual(
                arr([
                    obj({
                        name: 'lwc-rerender',
                        detail: obj({
                            devtools: obj({
                                properties: arr([
                                    arr([
                                        'Components',
                                        `<x-child> (\u00D72)`, // x2 with multiplication symbol
                                    ]),
                                    arr([
                                        `<x-child> (\u00D72)`, // x2 with multiplication symbol
                                        'firstName, lastName',
                                    ]),
                                ]),
                            }),
                        }),
                    }),
                ])
            );
        });

        it('Logs for deep non-enumerable prop mutation', async () => {
            elm.setWackyAccessorDeepValue('yolo');

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'wackyAccessors.foo.bar');
        });

        it('Logs for deep symbol prop mutation', async () => {
            elm.setWackyAccessorSymbol('haha');

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'wackyAccessors[Symbol(yolo)]');
        });

        it('Logs for doubly deep symbol prop mutation', async () => {
            elm.setWackyAccessorDoublyDeepSymbol('wahoo');

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'wackyAccessors[Symbol(whoa)].baz');
        });

        it('Logs for mutation on deeply-recursive object', async () => {
            elm.setOnRecursiveObject('woohoo');

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'recursiveObject.foo');
        });
    });

    describe('parent-child', () => {
        let elm;
        let child;

        beforeEach(async () => {
            elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            await new Promise(requestAnimationFrame);
            child = elm.shadowRoot.querySelector('x-child');

            await new Promise(requestAnimationFrame);
            expect(entries).toEqual(
                arr(
                    // synthetic lifecycle considers this one lwc-render event rather than two
                    lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
                        ? [obj({ name: 'lwc-render' })]
                        : [obj({ name: 'lwc-render' }), obj({ name: 'lwc-render' })]
                )
            );
            entries = []; // reset
        });

        it('Logs a mutation on the parent only', async () => {
            elm.firstName = 'Ferdinand';

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-parent', 'firstName');
        });

        it('Logs a mutation on the child only', async () => {
            child.lastName = 'Magellan';

            await new Promise(requestAnimationFrame);
            expectRerenderEntry('x-child', 'lastName');
        });

        it('Logs a mutation on both parent and child', async () => {
            elm.firstName = 'Ferdinand';
            child.lastName = 'Magellan';

            await new Promise(requestAnimationFrame);
            expect(entries).toEqual(
                arr([
                    obj({
                        name: 'lwc-rerender',
                        detail: obj({
                            devtools: obj({
                                properties: arr([
                                    arr(['Components', '<x-child>, <x-parent>']),
                                    arr(['<x-child>', 'lastName']),
                                    arr(['<x-parent>', 'firstName']),
                                ]),
                            }),
                        }),
                    }),
                ])
            );
        });
    });
});

it('handles case where the getter throws an error', async () => {
    const elm = createElement('x-getter-throws', { is: GetterThrows });
    document.body.appendChild(elm);

    await new Promise(requestAnimationFrame);

    expect(elm.shadowRoot.querySelector('div').textContent).toBe('hello');
});
