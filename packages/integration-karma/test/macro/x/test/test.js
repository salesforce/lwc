import { MacroElement, api } from 'lwc';

export default class Test extends MacroElement {
    @api renderDynamic = false;
    @api dynamicValue = 1;
    even = true;

    renderCount = 0;

    renderedCallback() {}

    increment() {
        this.renderCount++;
        this.even = this.renderCount % 2 == 0;
    }
}
