import { LightningElement, api } from 'lwc';

export { default as template1 } from './template-1.html';
export { default as template2 } from './template-2.html';

export default class DynamicTemplate extends LightningElement {
    @api template;

    render() {
        return this.template;
    }
}
