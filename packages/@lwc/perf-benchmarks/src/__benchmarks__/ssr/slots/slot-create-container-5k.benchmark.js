import { renderComponent } from '@lwc/ssr-runtime';
import SlotUsage from '@lwc/perf-benchmarks-components/dist/ssr/benchmark/slotUsageComponent/slotUsageComponent.js';
import Store from '@lwc/perf-benchmarks-components/dist/ssr/benchmark/store/store.js';

const ΝṲΜВЁṘ_ӨḞ_ṘОẈṠ = 5000;

benchmark(`ssr/slot/shadow/create/5k`, () => {
    let ṡtөṙе;
    let ŗоẇşОḟⅭоṁṗоņėпţẆіţḣЅļοt;
    let ṙөwṡӨfṠļоṫţеḋⅭоṅţеṅţ;

    before(() => {
        ṡtөṙе = new Store();
        ŗоẇşОḟⅭоṁṗоņėпţẆіţḣЅļοt = ṡtөṙе.buildData(ΝṲΜВЁṘ_ӨḞ_ṘОẈṠ);
        ṙөwṡӨfṠļоṫţеḋⅭоṅţеṅţ = ṡtөṙе.buildData(ΝṲΜВЁṘ_ӨḞ_ṘОẈṠ);
    });

    run(() => {
        const ṗṙоṗṡ = {
            rows: ṡtөṙе.data,
            componentContent: 'Parent component slotting content to child cmp',
            rowsOfSlottedContent: ṙөwṡӨfṠļоṫţеḋⅭоṅţеṅţ,
            titleOfComponentWithSlot: 'Component that receives a slot',
            rowsOfComponentWithSlot: ŗоẇşОḟⅭоṁṗоņėпţẆіţḣЅļοt,
        };
        return renderComponent('benchmark-slot-usage-component', SlotUsage, ṗṙоṗṡ);
    });
});
