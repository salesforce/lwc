import { LightningElement, api } from 'lwc';
import { func } from 'globalLib';

const a = func();

export default class FooInner extends LightningElement {
    @api
    get globalLibReturn() {
        return a;
    }
}
