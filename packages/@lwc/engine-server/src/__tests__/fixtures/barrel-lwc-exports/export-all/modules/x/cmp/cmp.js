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
import { importsToString } from '../../../../shared.js';

export default class extends LightningElement {
    imports = importsToString([
        getComponentDef,
        isComponentConstructor,
        createContextProvider,
        readonly,
        setFeatureFlagForTest,
        unwrap,
        createElement,
        renderComponent,
    ]);
}
