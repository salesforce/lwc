import { LightningElement, api, rendererFactory } from 'lwc';

// Exercises component code reaching the exported `rendererFactory` to build a renderer after the
// engine has already bootstrapped its base renderer (W-23814927). Whether that later invocation is
// allowed depends on the ENABLE_RENDERER_FACTORY_GUARD flag.
export default class Probe extends LightningElement {
    @api
    rebuildRenderer() {
        return rendererFactory({});
    }
}
