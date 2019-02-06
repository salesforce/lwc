import { LightningElement, api, track } from 'lwc';

export default class Test extends LightningElement {
    counter = 0;
    @track normalizedItems = [];

    @api
    get items() {
        return this.normalizedItems;
    }
    set items(items) {
        this.originalItems = items;
        this.normalizedItems = items.map(item => {
            const normalizedItem = {
                key: `id-${item}`,
                label: item,
            };

            return normalizedItem;
        });
    }

    @track normalizedCity = '';
    @api
    get city() {
        return this.normalizedCity;
    }
    set city(name) {
        this.normalizedCity = name.trim();
    }

    @api getRenderingCounter() {
        return this.counter;
    }
    renderedCallback() {
        this.counter++;
    }
}
