import { getOwnPropertyDescriptor, isUndefined, defineProperty } from './language';

if(isUndefined(getOwnPropertyDescriptor(Element.prototype, 'id'))) {
    const {
        get: idDescriptorGet,
        set: idDescriptorSet,
        enumerable: idDescriptorEnumerable,
        configurable: idDescriptorConfigurable,
    } = getOwnPropertyDescriptor(HTMLElement.prototype, 'id');
    defineProperty(Element.prototype, 'id', {
        enumerable: idDescriptorEnumerable,
        configurable: idDescriptorConfigurable,
        get(this: HTMLElement) {
            return idDescriptorGet.call(this);
        },
        set(this: HTMLElement, value: any) {
            return idDescriptorSet.call(this);
        }
    })
}