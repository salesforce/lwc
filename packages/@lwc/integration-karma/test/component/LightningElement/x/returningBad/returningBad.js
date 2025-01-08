import { LightningElement } from 'lwc'

export default class MyClass extends LightningElement {
    constructor() {
        super()

        const bad = {}
        LightningElement.call(bad)

        return bad
    }
}

let counter = -1
Object.defineProperty(MyClass, Symbol.hasInstance, {
    value: function() {
        console.log('counter', ++counter)
        return true;
    },
});
