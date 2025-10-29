import { LightningElement, api, track } from 'lwc';

const symbol = Symbol('yolo');
const anotherSymbol = Symbol('whoa');

const createWackyAccessors = () => {
    const res = {};
    const deep = {};
    // non-enumerable deep props
    Object.defineProperty(res, 'foo', {
        enumerable: false,
        writable: true,
        value: deep,
    });
    Object.defineProperty(deep, 'bar', {
        enumerable: false,
        writable: true,
        value: '',
    });
    res[symbol] = '';
    res[anotherSymbol] = { baz: '' };
    return res;
};

const createRecursiveObject = () => {
    const deep = {
        foo: '',
    };
    const res = {
        deep,
    };
    deep.deep = res;
    return res;
};

export default class extends LightningElement {
    @api firstName;
    @api lastName;
    @track previousName = {
        first: '',
        last: '',
        suffix: { short: '', long: '' },
        'full name': '',
    };
    @track wackyAccessors = createWackyAccessors();
    @track aliases = [];
    @track favoriteFlavors = [{ food: 'ice cream', flavor: '' }];
    @track recursiveObject = createRecursiveObject();

    get prettyPreviousName() {
        return `${this.previousName.first} ${this.previousName.last} (${this.previousName['full name']}) ${this.previousName.suffix.short} (${this.previousName.suffix.long})`;
    }

    get formattedWackyAccessors() {
        return `${this.wackyAccessors.foo.bar} - ${this.wackyAccessors[symbol]} - ${this.wackyAccessors[anotherSymbol].baz}`;
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

    @api setWackyAccessorDeepValue(value) {
        this.wackyAccessors.foo.bar = value;
    }

    @api setWackyAccessorSymbol(value) {
        this.wackyAccessors[symbol] = value;
    }

    @api setWackyAccessorDoublyDeepSymbol(value) {
        this.wackyAccessors[anotherSymbol].baz = value;
    }

    @api setOnRecursiveObject(value) {
        this.recursiveObject.deep.deep.foo = value;
    }
}
