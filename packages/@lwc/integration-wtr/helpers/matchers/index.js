import { registerConsoleMatchers } from './console.js';
import { registerErrorMatchers } from './errors.js';
import { registerJasmineMatchers } from './jasmine.js';

export const registerCustomMatchers = (chai, utils) => {
    registerConsoleMatchers(chai, utils);
    registerErrorMatchers(chai, utils);
    registerJasmineMatchers(chai, utils);
};
