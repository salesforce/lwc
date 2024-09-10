import { createElement } from 'lwc';
// import Parent from 'x/parent'
import Child from 'x/child';

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

describe('basic', () => {
    let elm;

    beforeEach(async () => {
        elm = createElement('x-child', { is: Child });
        document.body.appendChild(elm);

        await waitForSentinelMeasure();

        expect(entries.length).toBe(1);
        expect(entries[0].name).toBe('lwc-hydrate');
        entries = [];
    });

    it('Does basic mutation logging', async () => {
        elm.firstName = 'Ferdinand';
        await waitForSentinelMeasure();

        expect(entries.length).toBe(1);
        expect(entries[0].name).toBe('lwc-rehydrate');
        expect(entries[0].detail.devtools.properties).toEqual([
            ['Re-rendered Components', '<x-child>'],
            ['<x-child>', 'firstName'],
        ]);
    });

    it('Does deep mutation logging on an object', async () => {
        elm.setPreviousName('first', 'Vancouver');
        await waitForSentinelMeasure();

        expect(entries.length).toBe(1);
        expect(entries[0].name).toBe('lwc-rehydrate');
        expect(entries[0].detail.devtools.properties).toEqual([
            ['Re-rendered Components', '<x-child>'],
            ['<x-child>', 'previousName.first'],
        ]);
    });

    it('Does doubly-deep mutation logging on an object', async () => {
        elm.setPreviousNameSuffix('short', 'Jr.');
        await waitForSentinelMeasure();

        expect(entries.length).toBe(1);
        expect(entries[0].name).toBe('lwc-rehydrate');
        expect(entries[0].detail.devtools.properties).toEqual([
            ['Re-rendered Components', '<x-child>'],
            ['<x-child>', 'previousName.suffix.short'],
        ]);
    });

    it('Does deep mutation logging on an array', async () => {
        elm.addAlias('Magellan');
        await waitForSentinelMeasure();

        expect(entries.length).toBe(1);
        expect(entries[0].name).toBe('lwc-rehydrate');
        expect(entries[0].detail.devtools.properties).toEqual([
            ['Re-rendered Components', '<x-child>'],
            ['<x-child>', 'aliases.length'],
        ]);
    });

    it('Does deep mutation logging on an object within an array', async () => {
        elm.setFavoriteIceCreamFlavor('vanilla');
        await waitForSentinelMeasure();

        expect(entries.length).toBe(1);
        expect(entries[0].name).toBe('lwc-rehydrate');
        expect(entries[0].detail.devtools.properties).toEqual([
            ['Re-rendered Components', '<x-child>'],
            ['<x-child>', 'favoriteFlavors[0].flavor'],
        ]);
    });

    it('Tracks multiple mutations on the same component', async () => {
        elm.firstName = 'Ferdinand';
        elm.setPreviousNameSuffix('short', 'Jr.');
        elm.setFavoriteIceCreamFlavor('vanilla');
        await waitForSentinelMeasure();

        expect(entries.length).toBe(1);
        expect(entries[0].name).toBe('lwc-rehydrate');
        expect(entries[0].detail.devtools.properties).toEqual([
            ['Re-rendered Components', '<x-child>'],
            ['<x-child>', 'favoriteFlavors[0].flavor, firstName, previousName.suffix.short'],
        ]);
    });
});

describe('advanced', () => {
    it('tracks a component mutation while another component is rendered for the first time', async () => {
        const elm = createElement('x-child', { is: Child });
        document.body.appendChild(elm);

        await waitForSentinelMeasure();
        expect(entries.length).toBe(1);
        expect(entries[0].name).toBe('lwc-hydrate');
        entries = [];

        const elm2 = createElement('x-child', { is: Child });
        document.body.appendChild(elm2);
        elm.firstName = 'Ferdinand';

        await waitForSentinelMeasure();
        expect(entries.length).toBe(2);
        expect(entries[0].name).toBe('lwc-hydrate');

        expect(entries[1].name).toBe('lwc-rehydrate');
        expect(entries[1].detail.devtools.properties).toEqual([
            ['Re-rendered Components', '<x-child>'],
            ['<x-child>', 'firstName'],
        ]);
    });
});
