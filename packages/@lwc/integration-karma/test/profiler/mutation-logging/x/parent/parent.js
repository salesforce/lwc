import { LightningElement, api, track } from 'lwc';

export default class extends LightningElement {
    @api firstName;
    @api lastName;
    @track previousName = { first: '', last: '' };
    @track aliases = [];

    @api setPreviousName(prop, value) {
        this.previousName[prop] = value;
    }

    @api addAlias(alias) {
        this.aliases.push(alias);
    }
}
