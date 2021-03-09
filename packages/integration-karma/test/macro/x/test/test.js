import { MacroElement, api } from 'lwc';

export default class Test extends MacroElement {
    @api renderDynamic = false;
    @api dynamicValue = 1;

    renderCount = 0;

    @api getRenderCount() {
        return this.renderCount;
    }

    renderedCallback() {}

    increment() {
        this.renderCount++;
    }
}
