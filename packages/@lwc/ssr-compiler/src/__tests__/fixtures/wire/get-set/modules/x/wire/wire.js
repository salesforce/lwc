import { LightningElement, wire } from 'lwc';

import { adapter } from './adapter';

export default class Wire extends LightningElement {
    @wire(adapter, { name: 'getterOnly' })
    get getterOnly() {
        throw new Error('get getterOnly should not be called');
    }

    @wire(adapter, { name: 'setterOnly' })
    set setterOnly(v) {
        throw new Error('set setterOnly should not be called');
    }

    @wire(adapter, { name: 'getterWithSetter' })
    get getterWithSetter() {
        throw new Error('get getterWithSetter should not be called');
    }
    set getterWithSetter(v) {
        throw new Error('set getterWithSetter should not be called');
    }

    @wire(adapter, { name: 'setterWithGetter' })
    get setterWithGetter() {
        throw new Error('get setterWithGetter should not be called');
    }
    set setterWithGetter(v) {
        throw new Error('set setterWithGetter should not be called');
    }

    @wire(adapter, { name: 'bothDecorated' })
    get bothDecorated() {
        throw new Error('get bothDecorated should not be called');
    }

    @wire(adapter, { name: 'bothDecorated' })
    set bothDecorated(v) {
        throw new Error('set bothDecorated should not be called');
    }
}
