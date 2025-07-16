import { registerConsoleMatchers } from './console.mjs';
import { registerErrorMatchers } from './errors.mjs';
import { registerJasmineMatchers } from './jasmine.mjs';

export const registerCustomMatchers = (chai, utils) => {
    registerConsoleMatchers(chai, utils);
    registerErrorMatchers(chai, utils);
    registerJasmineMatchers(chai, utils);
};
