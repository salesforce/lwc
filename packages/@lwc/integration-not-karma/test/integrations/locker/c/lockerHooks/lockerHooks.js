import { LightningElement, api } from 'lwc';
import template from './lockerHooks.html';

export const hooks = {
    getHook: (target, property) => target[property],
    setHook: (target, property, value) => (target[property] = value),
    callHook: (target, method, args) => method.apply(target, args),
};

export default class LockerHooks extends LightningElement {
    @api publicProp;

    _privateProp;

    @api
    get publicAccessor() {
        return this._privateProp;
    }
    set publicAccessor(value) {
        this._privateProp = value;
    }

    @api
    publicMethod(...args) {
        return args;
    }

    constructor() {
        super(hooks);
    }

    // Test lifecycle hooks
    connectedCallback() {}
    renderedCallback() {}
    render() {
        return template;
    }
    disconnectedCallback() {}

    // Test event handler
    handleTest() {}
}
