// @flow

import { attribute, implement } from "aura";
import focusable from "lightning:focusable";
import classnames from "lightning:classnamesLib";

@implement(focusable)
export default class button {

    constructor() {
        this.domNodeElement = null;
    }

    @attribute({ required: true }) name;
    @attribute() value;
    @attribute() label;
    @attribute() variant = "neutral";
    @attribute() iconName;
    @attribute() iconPosition = "left";
    @attribute() class;
    @attribute() body;
    @attribute({ type: Boolean }) disabled = false;
    @attribute({ type: Function }) onclick;

    get hasLeftIcon(): Boolean {
        return this.iconName && this.iconPosition == 'left';
    }
    get hasRightIcon(): Boolean {
        return this.iconName && this.iconPosition == 'left';
    }
    get content(): String {
        return this.body.length > 0 ? this.body : [this.label];
    }
    get computedClass(): String {
        return classnames('slds-button', {
            'slds-button--neutral'     : this.variant === 'neutral',
            'slds-button--brand'       : this.variant === 'brand',
            'slds-button--destructive' : this.variant === 'destructive',
            'slds-button--inverse'     : this.variant === 'inverse',
        }, this.classes);
    }
    handleFocus(event: Event) {
        if (this.onfocus) {
            this.focus(event);
        }
    }
    handleBlur(event: Event) {
        if (this.onblur) {
            this.onblur(event);
        }
    }
    focus() {
        this.domNodeElement.focus();
    }
    attach(el: Node) {
        // storing the reference internally after it is attached the first time
        this.domNodeElement = el;
    }
    detach() {
        // releasing the backpointer to the dom
        this.domNodeElement = null;
    }
}
