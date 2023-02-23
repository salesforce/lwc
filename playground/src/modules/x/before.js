import { LightningElement,  } from 'lwc';

export default class extends LightningElement {
    field = 'some data';
    deep = { child: 'some other data' };

    get fieldWithFallback() {
        return this.field ?? 'fallback value';
    }
}
