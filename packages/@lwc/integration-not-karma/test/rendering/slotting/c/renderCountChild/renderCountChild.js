import { LightningElement, api } from 'lwc';

export default class RenderCountChild extends LightningElement {
    renderCount = 0;

    @api getRenderCount() {
        return this.renderCount;
    }

    renderedCallback() {
        this.renderCount++;
    }
}
