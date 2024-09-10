import { LightningElement, api, track } from 'lwc';

export default class extends LightningElement {
    @api firstName;
    @api lastName;
    @track previousName = { first: '', last: '', suffix: { short: '', long: '' } };
    @track aliases = [];
    @track favoriteFlavors = [{ food: 'ice cream', flavor: '' }];

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
}
