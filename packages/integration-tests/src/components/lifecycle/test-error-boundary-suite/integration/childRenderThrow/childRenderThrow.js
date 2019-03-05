import { LightningElement } from 'lwc';

export default class ChildRenderThrow extends LightningElement {
    constructor() {
        super();
    }
    render() {
        throw new Error('Child thew an error during rendering');
    }
}
