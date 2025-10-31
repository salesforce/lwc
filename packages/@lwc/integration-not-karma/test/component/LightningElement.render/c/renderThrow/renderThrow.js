import { LightningElement } from 'lwc';

export default class RenderThrow extends LightningElement {
    render() {
        throw new Error('throw in render');
    }
}
