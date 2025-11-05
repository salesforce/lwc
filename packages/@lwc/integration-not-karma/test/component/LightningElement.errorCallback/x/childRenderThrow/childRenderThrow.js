import { LightningElement } from 'lwc';

export default class ChildRenderThrow extends LightningElement {
    constructor() {
        super();
    }
    render() {
        throw new Error('Child threw an error during rendering');
    }
}
