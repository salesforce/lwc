import { LightningElement } from 'lwc';
import { computed, signal, effect } from "@preact/signals-core";
import { getCities } from './store';

export default class Example1 extends LightningElement {
    cities = [];

    filter = signal('');

    connectedCallback() {
        this.disposeEffect = effect(async () => {
            const result = await getCities(this.filter.value);

            this.cities = result;
        });
    }

    disconnectedCallback() {
        this.disposeEffect();
    }


    handleFilterChange(evt) {
        this.filter.value = evt.target.value;
    }

    renderedCallback() {
        console.log('rendered [Example 1]');
    }
    
}