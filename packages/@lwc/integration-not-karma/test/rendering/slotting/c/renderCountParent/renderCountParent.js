import { LightningElement, api } from 'lwc';

export default class RenderCountParent extends LightningElement {
    @api value;

    renderCount = 0;

    @api getRenderCount() {
        return this.renderCount;
    }

    renderedCallback() {
        this.renderCount++;
    }
}
