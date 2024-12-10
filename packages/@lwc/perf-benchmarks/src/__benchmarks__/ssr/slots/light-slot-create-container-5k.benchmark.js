import { renderComponent } from '@lwc/ssr-runtime';
import SlotUsage from '@lwc/perf-benchmarks-components/dist/ssr/benchmark/slotUsageComponentLight/slotUsageComponentLight.js';
import Store from '@lwc/perf-benchmarks-components/dist/ssr/benchmark/store/store.js';

const NUMBER_OF_ROWS = 5000;

benchmark(`ssr/slot/light/create/5k`, () => {
    let store;
    let rowsOfComponentWithSlot;
    let rowsOfSlottedContent;

    before(() => {
        store = new Store();
        rowsOfComponentWithSlot = store.buildData(NUMBER_OF_ROWS);
        rowsOfSlottedContent = store.buildData(NUMBER_OF_ROWS);
    });

    run(() => {
        const props = {
            rows: store.data,
            componentContent: 'Parent component slotting content to child cmp',
            rowsOfSlottedContent: rowsOfSlottedContent,
            titleOfComponentWithSlot: 'Component that receives a slot',
            rowsOfComponentWithSlot: rowsOfComponentWithSlot,
        };
        return renderComponent('benchmark-slot-usage-component-light', SlotUsage, props);
    });
});
