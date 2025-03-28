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
} from '../../../barrel.js';

export default class extends LightningElement {
    imports = [
        getComponentDef,
        isComponentConstructor,
        createContextProvider,
        readonly,
        setFeatureFlagForTest,
        unwrap,
        createElement,
        renderComponent,
    ]
        // renderComponent is aliased here: https://github.com/salesforce/lwc/blob/5d01843a7733a03b9ccb59a70ad64af955f15b88/packages/%40lwc/ssr-runtime/src/index.ts#L31
        .map((i) => (i.name === 'serverSideRenderComponent' ? 'renderComponent' : i.name))
        .join('\n      ');
}
