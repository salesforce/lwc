import { foo } from '../../../barrel.js';
import { importsToString } from '../../../../shared.js';

export default class extends foo.LightningElement {
    imports = importsToString([
        foo.getComponentDef,
        foo.isComponentConstructor,
        foo.createContextProvider,
        foo.readonly,
        foo.setFeatureFlagForTest,
        foo.unwrap,
        foo.createElement,
        foo.renderComponent,
    ]);
}
