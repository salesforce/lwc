import { defineProperty, setPrototypeOf } from '@lwc/shared';
import { BaseLightningElement, BaseLightningElementConstructor } from './base-lightning-element';
import { vmBeingConstructed } from './invoker';
import { patchShadowRootWithRestrictions } from './restrictions';
import { associateVM, getAssociatedVM } from './vm';

export interface LightningElement extends BaseLightningElement {
    template: ShadowRoot;
}

// @ts-ignore
export const LightningElement: BaseLightningElementConstructor = function (
    this: LightningElement
): LightningElement {
    // @ts-ignore
    BaseLightningElement.apply(this, arguments);

    const vm = vmBeingConstructed!;
    const {
        elm,
        mode,
        renderer,
        def: { ctor },
    } = vm;

    const cmpRoot = renderer.attachShadow(elm, {
        mode,
        delegatesFocus: !!ctor.delegatesFocus,
        '$$lwc-synthetic-mode$$': true,
    } as any);

    vm.cmpRoot = cmpRoot;
    associateVM(cmpRoot, vm);

    // Adding extra guard rails in DEV mode.
    if (process.env.NODE_ENV !== 'production') {
        patchShadowRootWithRestrictions(cmpRoot);
    }
    return this;
};

// @ts-ignore
LightningElement.prototype = Object.create(BaseLightningElement.prototype);
LightningElement.prototype.constructor = LightningElement;

defineProperty(LightningElement.prototype, 'template', {
    get() {
        const vm = getAssociatedVM(this);
        return vm.cmpRoot;
    },
    configurable: true,
});

setPrototypeOf(LightningElement, BaseLightningElement);
