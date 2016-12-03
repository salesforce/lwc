// @flow

import focusable from "lightning:focusable";
import classnames from "lightning:classnamesLib";

export default class button {

    // public attributes
    @prop name;
    @prop value;
    @prop label;
    @prop variant = "neutral";
    @prop iconName;
    @prop iconPosition = "left";
    @prop class;
    @prop body;
    @prop disabled: boolean = false;
    @prop onclick;

    // public methods
    @method focus() {
        this.domNodeElement.focus();
    }

    // internals only accesible from template
    get hasLeftIcon(): boolean {
        return this.iconName && this.iconPosition == 'left';
    }
    get hasRightIcon(): boolean {
        return this.iconName && this.iconPosition == 'left';
    }
    get content(): string {
        return this.body.length > 0 ? this.body : [this.label];
    }
    get computedClass(): string {
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

    // lifecycle hooks
    constructor() {
        this.domNodeElement = null;
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
