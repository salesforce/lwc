/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Stubs for all the un-implemented exports from @lwc/engine-server

export function api(..._: unknown[]): never {
    throw new Error('@api cannot be used in SSR context.');
}
export function createContextProvider(..._: unknown[]): never {
    throw new Error('createContextProvider cannot be used in SSR context.');
}
export function createElement(..._: unknown[]): never {
    throw new Error('createElement cannot be used in SSR context.');
}
export function freezeTemplate(..._: unknown[]): never {
    throw new Error('freezeTemplate cannot be used in SSR context.');
}
export function getComponentDef(..._: unknown[]): never {
    throw new Error('getComponentDef cannot be used in SSR context.');
}
export function isComponentConstructor(..._: unknown[]): never {
    throw new Error('isComponentConstructor cannot be used in SSR context.');
}
export function parseFragment(..._: unknown[]): never {
    throw new Error('parseFragment cannot be used in SSR context.');
}
export function parseSVGFragment(..._: unknown[]): never {
    throw new Error('parseSVGFragment cannot be used in SSR context.');
}
export function readonly(..._: unknown[]): never {
    throw new Error('readonly cannot be used in SSR context.');
}
export function registerComponent(..._: unknown[]): never {
    throw new Error('registerComponent cannot be used in SSR context.');
}
export function registerDecorators(..._: unknown[]): never {
    throw new Error('registerDecorators cannot be used in SSR context.');
}
export function registerTemplate(..._: unknown[]): never {
    throw new Error('registerTemplate cannot be used in SSR context.');
}
export function sanitizeAttribute(..._: unknown[]): never {
    throw new Error('sanitizeAttribute cannot be used in SSR context.');
}
export function setFeatureFlag(..._: unknown[]): never {
    throw new Error('setFeatureFlag cannot be used in SSR context.');
}
export function setFeatureFlagForTest(..._: unknown[]): never {
    throw new Error('setFeatureFlagForTest cannot be used in SSR context.');
}
export function setHooks(..._: unknown[]): never {
    throw new Error('setHooks cannot be used in SSR context.');
}
export function swapComponent(..._: unknown[]): never {
    throw new Error('swapComponent cannot be used in SSR context.');
}
export function swapStyle(..._: unknown[]): never {
    throw new Error('swapStyle cannot be used in SSR context.');
}
export function swapTemplate(..._: unknown[]): never {
    throw new Error('swapTemplate cannot be used in SSR context.');
}
export function track(..._: unknown[]): never {
    throw new Error('@track cannot be used in SSR context.');
}
export function unwrap(..._: unknown[]): never {
    throw new Error('unwrap cannot be used in SSR context.');
}
export function wire(..._: unknown[]): never {
    throw new Error('@wire cannot be used in SSR context.');
}

export const renderer = {
    isSyntheticShadowDefined: false,
    insert(..._: unknown[]): never {
        throw new Error('renderer.insert cannot be used in SSR context.');
    },
    remove(..._: unknown[]): never {
        throw new Error('renderer.remove cannot be used in SSR context.');
    },
    cloneNode(..._: unknown[]): never {
        throw new Error('renderer.cloneNode cannot be used in SSR context.');
    },
    createFragment(..._: unknown[]): never {
        throw new Error('renderer.createFragment cannot be used in SSR context.');
    },
    createElement(..._: unknown[]): never {
        throw new Error('renderer.createElement cannot be used in SSR context.');
    },
    createText(..._: unknown[]): never {
        throw new Error('renderer.createText cannot be used in SSR context.');
    },
    createComment(..._: unknown[]): never {
        throw new Error('renderer.createComment cannot be used in SSR context.');
    },
    createCustomElement(..._: unknown[]): never {
        throw new Error('renderer.createCustomElement cannot be used in SSR context.');
    },
    nextSibling(..._: unknown[]): never {
        throw new Error('renderer.nextSibling cannot be used in SSR context.');
    },
    previousSibling(..._: unknown[]): never {
        throw new Error('renderer.previousSibling cannot be used in SSR context.');
    },
    attachShadow(..._: unknown[]): never {
        throw new Error('renderer.attachShadow cannot be used in SSR context.');
    },
    getProperty(..._: unknown[]): never {
        throw new Error('renderer.getProperty cannot be used in SSR context.');
    },
    setProperty(..._: unknown[]): never {
        throw new Error('renderer.setProperty cannot be used in SSR context.');
    },
    setText(..._: unknown[]): never {
        throw new Error('renderer.setText cannot be used in SSR context.');
    },
    getAttribute(..._: unknown[]): never {
        throw new Error('renderer.getAttribute cannot be used in SSR context.');
    },
    setAttribute(..._: unknown[]): never {
        throw new Error('renderer.setAttribute cannot be used in SSR context.');
    },
    removeAttribute(..._: unknown[]): never {
        throw new Error('renderer.removeAttribute cannot be used in SSR context.');
    },
    addEventListener(..._: unknown[]): never {
        throw new Error('renderer.addEventListener cannot be used in SSR context.');
    },
    removeEventListener(..._: unknown[]): never {
        throw new Error('renderer.removeEventListener cannot be used in SSR context.');
    },
    dispatchEvent(..._: unknown[]): never {
        throw new Error('renderer.dispatchEvent cannot be used in SSR context.');
    },
    getClassList(..._: unknown[]): never {
        throw new Error('renderer.getClassList cannot be used in SSR context.');
    },
    setCSSStyleProperty(..._: unknown[]): never {
        throw new Error('renderer.setCSSStyleProperty cannot be used in SSR context.');
    },
    getBoundingClientRect(..._: unknown[]): never {
        throw new Error('renderer.getBoundingClientRect cannot be used in SSR context.');
    },
    querySelector(..._: unknown[]): never {
        throw new Error('renderer.querySelector cannot be used in SSR context.');
    },
    querySelectorAll(..._: unknown[]): never {
        throw new Error('renderer.querySelectorAll cannot be used in SSR context.');
    },
    getElementsByTagName(..._: unknown[]): never {
        throw new Error('renderer.getElementsByTagName cannot be used in SSR context.');
    },
    getElementsByClassName(..._: unknown[]): never {
        throw new Error('renderer.getElementsByClassName cannot be used in SSR context.');
    },
    getChildren(..._: unknown[]): never {
        throw new Error('renderer.getChildren cannot be used in SSR context.');
    },
    getChildNodes(..._: unknown[]): never {
        throw new Error('renderer.getChildNodes cannot be used in SSR context.');
    },
    getFirstChild(..._: unknown[]): never {
        throw new Error('renderer.getFirstChild cannot be used in SSR context.');
    },
    getFirstElementChild(..._: unknown[]): never {
        throw new Error('renderer.getFirstElementChild cannot be used in SSR context.');
    },
    getLastChild(..._: unknown[]): never {
        throw new Error('renderer.getLastChild cannot be used in SSR context.');
    },
    getLastElementChild(..._: unknown[]): never {
        throw new Error('renderer.getLastElementChild cannot be used in SSR context.');
    },
    getTagName(..._: unknown[]): never {
        throw new Error('renderer.getTagName cannot be used in SSR context.');
    },
    getStyle(..._: unknown[]): never {
        throw new Error('renderer.getStyle cannot be used in SSR context.');
    },
    isConnected(..._: unknown[]): never {
        throw new Error('renderer.isConnected cannot be used in SSR context.');
    },
    insertStylesheet(..._: unknown[]): never {
        throw new Error('renderer.insertStylesheet cannot be used in SSR context.');
    },
    assertInstanceOfHTMLElement(..._: unknown[]): never {
        throw new Error('renderer.assertInstanceOfHTMLElement cannot be used in SSR context.');
    },
    ownerDocument(..._: unknown[]): never {
        throw new Error('renderer.ownerDocument cannot be used in SSR context.');
    },
    registerContextConsumer(..._: unknown[]): never {
        throw new Error('renderer.registerContextConsumer cannot be used in SSR context.');
    },
    attachInternals(..._: unknown[]): never {
        throw new Error('renderer.attachInternals cannot be used in SSR context.');
    },
    defineCustomElement(..._: unknown[]): never {
        throw new Error('renderer.defineCustomElement cannot be used in SSR context.');
    },
    getParentNode(..._: unknown[]): never {
        throw new Error('renderer.getParentNode cannot be used in SSR context.');
    },
    startTrackingMutations(..._: unknown[]): never {
        throw new Error('renderer.startTrackingMutations cannot be used in SSR context.');
    },
    stopTrackingMutations(..._: unknown[]): never {
        throw new Error('renderer.stopTrackingMutations cannot be used in SSR context.');
    },
};

/**
 * The hot API is used to orchestrate hot swapping in client rendered components.
 * It doesn't do anything on the server side, however, you may import it.
 *
 * The whole point of defining this and exporting it is so that you can import it in isomorphic code without
 * an error being thrown by the import itself.
 */
// A real stub, not a "not implemented" one! 😯
export const hot = undefined;
