import { LightningElement, api } from 'lwc';

export let roleSetterCallCount = 0;
export default class MyComponent extends LightningElement {
    get role() {
        return 'role';
    }
    @api
    set role(value) {
        roleSetterCallCount += 1;
    }
}
