import { concatClassnames } from "./helper/classname.js";

export default class Bar {
    x;
    y = 0;

    get computedClasses() {
        return concatClassnames('slds-list-item', 'item-' + this.y);
    }

    handleClick() {
        console.log('<li> was clicked');
    }
}

// Example of usage:
// <Foo x="5" />
// and optional argument y, which defauls to 0
