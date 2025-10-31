import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api renderDynamic = false;
    @api dynamicValue = 1;

    renderCount = 0;

    @api getRenderCount() {
        return this.renderCount;
    }

    renderedCallback() {
        this.renderCount++;
    }
}
