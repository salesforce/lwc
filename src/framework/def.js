// @flow

import { getAttributesConfig } from "./attribute.js";
import { getMethodsConfig } from "./method.js";
import assert from "./assert.js";

const CtorToDefMap = new WeakMap();

export function getComponentDef(Ctor: Object): Object {
    if (CtorToDefMap.has(Ctor)) {
        return CtorToDefMap.get(Ctor);
    }
    const attributes = getAttributesConfig(Ctor);
    const methods = getMethodsConfig(Ctor);
    const def = {
        name: Ctor.constructor && Ctor.constructor.vnodeType,
        attributes,
        methods,
    };
    assert.block(() => {
        Object.freeze(def);
        Object.freeze(attributes);
        Object.freeze(methods);
    });
    CtorToDefMap.set(Ctor, def);
    return def;
}
