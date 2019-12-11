import { LightningElement, api, track } from 'lwc';

class BaseKlass extends LightningElement {
    inheritedValue = 'initial';
}

export default class Simple extends BaseKlass {
    @api static;
    @track trackedField;
    simpleValue = 'initial';
    complexValue = {
        name: 'foo',
        lastName: 'bar',
    };

    constructor() {
        super();
        this.expandoField = 'initial';
    }

    @api setValue(field, value) {
        this[field] = value;
    }

    @api getValue(field) {
        return this[field];
    }

    @api mutateComplexValue() {
        this.complexValue.name = 'mutated name';
        this.complexValue.lastName = 'mutated lastName';
    }
}
