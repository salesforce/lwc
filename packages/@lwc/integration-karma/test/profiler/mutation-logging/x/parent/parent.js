import { LightningElement, api, track } from 'lwc';

export default class extends LightningElement {
    @api firstName;
    @api lastName;
    @track previousName = {
        first: '',
        last: '',
        suffix: { short: '', long: '' },
        'full name': '',
    };
    @track aliases = [];
    @track favoriteFlavors = [{ food: 'ice cream', flavor: '' }];

    get prettyPreviousName() {
        return `${this.previousName.first} ${this.previousName.last} (${this.previousName['full name']}) ${this.previousName.suffix.short} (${this.previousName.suffix.long})`;
    }

    @api setPreviousName(prop, value) {
        this.previousName[prop] = value;
    }

    @api addAlias(alias) {
        this.aliases.push(alias);
    }

    @api setPreviousNameSuffix(prop, value) {
        this.previousName.suffix[prop] = value;
    }

    @api setFavoriteIceCreamFlavor(value) {
        this.favoriteFlavors[0].flavor = value;
    }

    @api setPreviousNameFullName(value) {
        this.previousName['full name'] = value;
    }
}
