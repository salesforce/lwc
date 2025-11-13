import { LightningElement } from 'lwc';

export let renderCount = 0;
export function resetRenderCount() {
    renderCount = 0;
}
export default class MyComponent extends LightningElement {
    renderedCallback() {
        renderCount++;
    }
}
