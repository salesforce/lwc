import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    async #fetchData() {
        return await Promise.resolve(42);
    }
}
