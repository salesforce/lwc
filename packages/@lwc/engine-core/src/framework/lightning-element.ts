import { BaseLightningElement, BaseLightningElementConstructor } from './base-lightning-element';

export interface LightningElement extends BaseLightningElement {
    template: ShadowRoot;
}

// @ts-ignore
export const LightningElement: BaseLightningElementConstructor = function (
    this: LightningElement
): LightningElement {
    // @ts-ignore
    BaseLightningElement.apply(this, arguments);
    return this;
};

// @ts-ignore
LightningElement.prototype = Object.create(BaseLightningElement.prototype);
LightningElement.prototype.constructor = LightningElement;
