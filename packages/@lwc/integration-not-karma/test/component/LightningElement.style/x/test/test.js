import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api
    get thisDotStyle() {
        return this.style;
    }
}
