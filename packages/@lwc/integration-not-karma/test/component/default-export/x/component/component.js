import { LightningElement } from 'lwc';

import undef from './undef.js';
import nil from './nil.js';
import zero from './zero.js';
import string from './string.js';

const stringify = (_) => (typeof _ === 'undefined' ? 'undefined' : JSON.stringify(_));

export default class extends LightningElement {
    undef = stringify(undef);
    nil = stringify(nil);
    zero = stringify(zero);
    string = stringify(string);
}
