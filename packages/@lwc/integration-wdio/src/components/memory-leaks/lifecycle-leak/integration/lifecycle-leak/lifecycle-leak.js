import { LightningElement, createElement } from 'lwc';
import Child from '../child/child.js';

export default class extends LightningElement {
    addChild() {
        this.refs.container.appendChild(createElement('integration-child', { is: Child }));
    }

    removeChildren() {
        // Our monkey-patching for synthetic lifecycle events covers removeChild, but not innerHTML = ''
        this.refs.container.innerHTML = '';
    }
}
