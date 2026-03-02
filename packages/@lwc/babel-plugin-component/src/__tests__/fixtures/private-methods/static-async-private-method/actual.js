import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    static async #fetchData(url) {
        const response = await fetch(url);
        return response.json();
    }
    async connectedCallback() {
        const data = await Test.#fetchData('/api/data');
        console.log(data);
    }
}
