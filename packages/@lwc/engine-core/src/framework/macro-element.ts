import { defineProperty, setPrototypeOf } from '@lwc/shared';
import { BaseLightningElement, BaseLightningElementConstructor } from './base-lightning-element';

export interface MacroElement extends BaseLightningElement {
    template: null;
}

// @ts-ignore
export const MacroElement: BaseLightningElementConstructor = function (
    this: MacroElement
): MacroElement {
    // @ts-ignore
    BaseLightningElement.apply(this, arguments);
    return this;
};

// @ts-ignore
MacroElement.prototype = Object.create(BaseLightningElement.prototype);
MacroElement.prototype.constructor = MacroElement;

defineProperty(MacroElement.prototype, 'template', {
    get() {
        return null;
    },
    configurable: true,
});

setPrototypeOf(MacroElement, BaseLightningElement);
