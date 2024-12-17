// Barrel exporting from 'lwc' should work
// These imports are the ones that are allowed by the no-disallowed-lwc-imports eslint rule
// Ref: https://github.com/salesforce/eslint-plugin-lwc/blob/34911de749e20cabbf48f5585c92a4b62d082a41/lib/rules/no-disallowed-lwc-imports.js#L11
export {
    LightningElement,
    getComponentDef as getComponentDefAlias,
    isComponentConstructor,
    createContextProvider,
    readonly,
    setFeatureFlagForTest,
    unwrap,
    createElement,
    renderComponent,
} from 'lwc';
