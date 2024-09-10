import { createElement } from 'lwc';
import Parent from 'x/parent';
import Child from 'x/child';

const arr = jasmine.arrayWithExactContents;
const obj = jasmine.objectContaining;
const str = jasmine.stringMatching;

const sentinelObserver = new EventTarget();

let entries = [];
let observer;

beforeEach(() => {
    observer = new PerformanceObserver((list) => {
        const newEntries = list.getEntries();
        entries.push(
            ...newEntries.filter((_) => ['lwc-hydrate', 'lwc-rehydrate'].includes(_.name))
        );
        if (newEntries.some((_) => _.name === 'sentinel')) {
            sentinelObserver.dispatchEvent(new CustomEvent('sentinel'));
        }
    });
    observer.observe({ entryTypes: ['measure'] });
});

afterEach(() => {
    entries = [];
    observer.disconnect();
});

// We have to wait for a "sentinel" measure because the PerformanceObserver doesn't guarantee when it's
// going to be called.
async function waitForSentinelMeasure() {
    await Promise.resolve(); // wait a tick for the component itself to render
    await new Promise((resolve) => {
        sentinelObserver.addEventListener('sentinel', resolve, { once: true });
        performance.measure('sentinel');
    });
}

function rehydrationEntry(tagName, propString) {
    const tagNameRegex = new RegExp(`<${tagName}> \\(id: \\d+\\)`);
    return obj({
        name: 'lwc-rehydrate',
        detail: obj({
            devtools: obj({
                properties: arr([
                    arr(['Re-rendered Component', str(tagNameRegex)]),
                    arr([str(tagNameRegex), propString]),
                ]),
            }),
        }),
    });
}

function expectRehydrationEntry(tagName, propString) {
    expect(entries).toEqual(arr([rehydrationEntry(tagName, propString)]));
}

if (process.env.NODE_ENV === 'production') {
    it('No perf measures in prod mode', async () => {
        const elm = createElement('x-child', { is: Child });
        document.body.appendChild(elm);

        await waitForSentinelMeasure();
        elm.firstName = 'Ferdinand';

        await waitForSentinelMeasure();
        expect(entries).toEqual([]);
    });
} else {
    // dev mode
    describe('basic', () => {
        let elm;

        beforeEach(async () => {
            elm = createElement('x-child', { is: Child });
            document.body.appendChild(elm);

            await waitForSentinelMeasure();
            expect(entries).toEqual(arr([obj({ name: 'lwc-hydrate' })]));
            entries = []; // reset
        });

        it('Does basic mutation logging', async () => {
            elm.firstName = 'Ferdinand';

            await waitForSentinelMeasure();
            expectRehydrationEntry('x-child', 'firstName');
        });

        it('Logs subsequent mutations on the same component', async () => {
            elm.firstName = 'Ferdinand';

            await waitForSentinelMeasure();
            expectRehydrationEntry('x-child', 'firstName');
            entries = []; // reset

            elm.lastName = 'Magellan';

            await waitForSentinelMeasure();
            expectRehydrationEntry('x-child', 'lastName');
            entries = []; // reset

            elm.firstName = 'Vasco';
            elm.lastName = 'da Gama';

            await waitForSentinelMeasure();
            expectRehydrationEntry('x-child', 'firstName, lastName');
        });

        it('Logs deep mutation on an object', async () => {
            elm.setPreviousName('first', 'Vancouver');

            await waitForSentinelMeasure();
            expectRehydrationEntry('x-child', 'previousName.first');
        });

        it('Logs doubly-deep mutation on an object', async () => {
            elm.setPreviousNameSuffix('short', 'Jr.');

            await waitForSentinelMeasure();
            expectRehydrationEntry('x-child', 'previousName.suffix.short');
        });

        it('Logs deep mutation on an array', async () => {
            elm.addAlias('Magellan');

            await waitForSentinelMeasure();
            expectRehydrationEntry('x-child', 'aliases.length');
        });

        it('Logs deep mutation on an object within an array', async () => {
            elm.setFavoriteIceCreamFlavor('vanilla');

            await waitForSentinelMeasure();
            expectRehydrationEntry('x-child', 'favoriteFlavors[0].flavor');
        });

        it('Logs multiple mutations on the same component', async () => {
            elm.firstName = 'Ferdinand';
            elm.setPreviousNameSuffix('short', 'Jr.');
            elm.setFavoriteIceCreamFlavor('vanilla');

            await waitForSentinelMeasure();
            expectRehydrationEntry(
                'x-child',
                'favoriteFlavors[0].flavor, firstName, previousName.suffix.short'
            );
        });

        it('Logs a component mutation while another component is rendered for the first time', async () => {
            const elm2 = createElement('x-child', { is: Child });
            document.body.appendChild(elm2);
            elm.firstName = 'Ferdinand';

            await waitForSentinelMeasure();
            expect(entries).toEqual(
                arr([
                    obj({
                        name: 'lwc-hydrate',
                    }),
                    rehydrationEntry('x-child', 'firstName'),
                ])
            );
        });
    });

    describe('parent-child', () => {
        let elm;
        let child;

        beforeEach(async () => {
            elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            await Promise.resolve();
            child = elm.shadowRoot.querySelector('x-child');

            await waitForSentinelMeasure();
            expect(entries).toEqual(
                arr(
                    // synthetic lifecycle considers this one hydration event rather than two
                    lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
                        ? [obj({ name: 'lwc-hydrate' })]
                        : [obj({ name: 'lwc-hydrate' }), obj({ name: 'lwc-hydrate' })]
                )
            );
            entries = []; // reset
        });

        it('Logs a mutation on the parent only', async () => {
            elm.firstName = 'Ferdinand';

            await waitForSentinelMeasure();
            expectRehydrationEntry('x-parent', 'firstName');
        });

        it('Logs a mutation on the child only', async () => {
            child.lastName = 'Magellan';

            await waitForSentinelMeasure();
            expectRehydrationEntry('x-child', 'lastName');
        });

        it('Logs a mutation on both parent and child', async () => {
            elm.firstName = 'Ferdinand';
            child.lastName = 'Magellan';

            await waitForSentinelMeasure();
            expect(entries).toEqual(
                arr([
                    obj({
                        name: 'lwc-rehydrate',
                        detail: obj({
                            devtools: obj({
                                properties: arr([
                                    arr([
                                        'Re-rendered Components',
                                        str(/<x-child> \(id: \d+\), <x-parent> \(id: \d+\)/),
                                    ]),
                                    arr([str(/<x-child> \(id: \d+\)/), 'lastName']),
                                    arr([str(/<x-parent> \(id: \d+\)/), 'firstName']),
                                ]),
                            }),
                        }),
                    }),
                ])
            );
        });
    });
}
