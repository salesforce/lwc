type InstrumentedWindow = (Window & typeof globalThis) & {
    __lwc_instrument_cmp_def?: (def: any) => void;
    __lwc_instrument_cmp_instance?: (instance: any, vm: any) => void;
};

const win = typeof window !== 'undefined' ? (window as InstrumentedWindow) : null;

function noop() {}

export const instrumentDef = win?.__lwc_instrument_cmp_def ?? noop;
export const instrumentInstance = win?.__lwc_instrument_cmp_instance ?? noop;
