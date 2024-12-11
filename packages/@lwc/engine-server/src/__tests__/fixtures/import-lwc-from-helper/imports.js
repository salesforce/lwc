// Importing from 'lwc' from a non-component file should work
// These imports are the ones that are allowed by the no-disallowed-lwc-imports eslint rule
// Ref: https://github.com/salesforce/eslint-plugin-lwc/blob/34911de749e20cabbf48f5585c92a4b62d082a41/lib/rules/no-disallowed-lwc-imports.js#L11
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
} from 'lwc';

// "Using" the imports so they don't get removed by the compiler
if (globalThis.propThatDoesntExistButWontGetCompiledAway) {
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
}
