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

it('Does basic mutation logging', async () => {
    const elm = createElement('x-child', { is: Child });
    document.body.appendChild(elm);

    await waitForSentinelMeasure();

    expect(entries.length).toBe(1);
    expect(entries[0].name).toBe('lwc-hydrate');
    entries = [];

    elm.firstName = 'Ferdinand';
    await waitForSentinelMeasure();

    expect(entries.length).toBe(1);
    expect(entries[0].name).toBe('lwc-rehydrate');
    expect(entries[0].detail.devtools.properties).toEqual([['<x-child>', 'firstName']]);
});

it('Does deep mutation logging on an object', async () => {
    const elm = createElement('x-child', { is: Child });
    document.body.appendChild(elm);

    await waitForSentinelMeasure();

    expect(entries.length).toBe(1);
    expect(entries[0].name).toBe('lwc-hydrate');
    entries = [];

    elm.setPreviousName('first', 'Vancouver');
    await waitForSentinelMeasure();

    expect(entries.length).toBe(1);
    expect(entries[0].name).toBe('lwc-rehydrate');
    expect(entries[0].detail.devtools.properties).toEqual([['<x-child>', 'previousName.first']]);
});

it('Does deep mutation logging on an array', async () => {
    const elm = createElement('x-child', { is: Child });
    document.body.appendChild(elm);

    await waitForSentinelMeasure();

    expect(entries.length).toBe(1);
    expect(entries[0].name).toBe('lwc-hydrate');
    entries = [];

    elm.addAlias('Magellan');
    await waitForSentinelMeasure();

    expect(entries.length).toBe(1);
    expect(entries[0].name).toBe('lwc-rehydrate');
    expect(entries[0].detail.devtools.properties).toEqual([['<x-child>', 'aliases.length']]);
});
