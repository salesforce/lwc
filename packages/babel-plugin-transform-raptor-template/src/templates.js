import {API_PARAM , CMP_INSTANCE, SLOT_SET } from './constants';
import { template } from 'babel-core';

 export const moduleExports = template(`
const memoized = Symbol();
export default function (${API_PARAM}, ${CMP_INSTANCE}, ${SLOT_SET}) {
    const m = ${CMP_INSTANCE}[memoized] || (${CMP_INSTANCE}[memoized] = {});
    return STATEMENT;
}`, { sourceType: 'module' });

export const memoizeLookup = template(`m.ID || (m.ID = ID(${API_PARAM}, ${CMP_INSTANCE}))`);
export const memoizeFunction = template(`const ID = function (${API_PARAM}, ${CMP_INSTANCE}) { return STATEMENT; }`);
