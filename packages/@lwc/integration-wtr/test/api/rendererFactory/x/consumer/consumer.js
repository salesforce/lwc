import { LightningElement, api, rendererFactory } from 'lwc';

// A component that invokes the exported `rendererFactory` directly. Direct invocation is not a
// supported use of the public export, so with the guard active this throws and `error` captures it.
export default class extends LightningElement {
    @api error = null;
    @api result = null;

    @api
    invokeRendererFactory() {
        try {
            this.result = rendererFactory(null).getProperty(this.template.host, 'tagName');
        } catch (error) {
            this.error = error;
        }
    }
}
