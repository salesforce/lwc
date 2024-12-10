// Everything else can be imported in a helper, so we must check in the helper
import {
    LightningElement,
    getComponentDef,
    isComponentConstructor,
    createContextProvider,
    readonly,
    setFeatureFlagForTest,
    unwrap,
    createElement,
    renderComponent,
} from '../../../imports.js';

// "Using" the imports so they don't get removed by the compiler
console.log(
    LightningElement,
    // The LWC compiler doesn't let us use decorators like this, so we don't need to check them here
    // api,
    // track,
    // wire,
    getComponentDef,
    isComponentConstructor,
    createContextProvider,
    readonly,
    setFeatureFlagForTest,
    unwrap,
    createElement,
    renderComponent
);

export default class extends LightningElement {}
