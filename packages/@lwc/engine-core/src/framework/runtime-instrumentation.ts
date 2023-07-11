import { noop } from '@lwc/shared';
import { globalThis } from '@lwc/shared';

export const instrumentDef = globalThis.__lwc_instrument_cmp_def ?? noop;
export const instrumentInstance = globalThis.__lwc_instrument_cmp_instance ?? noop;
