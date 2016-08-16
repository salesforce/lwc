import {
    AuraComponent,
} from "aura";

import {
    virtual,
    marker,
} from "aura:component";

import {
    Compiled as superbutton,
} from "mynamespace:superbutton"

export class Compiled extends AuraComponent {
    get label1() {
        return 'first';
    }
    get label2() {
        return 'second';
    }
    get foo() {
        return 1;
    }
    get bar() {
        return 2;
    }
    render({
        isDirty,
        updateAttributeInMarkup,
        updateRefComponetAttribute,
        updateContentInMarkup,
        unmountRefComponent,
        mountComponentAfterMarker,
        componentWasRehydrated,
    }) {
        // this code is produced by the compilation process.
        // it not be expose to user-land, only used by the render engine
        // as a complement of the component instance.
        // invariant: this process is side-effect free on the component state
        const rehydrate = () => {
            if (isDirty(this, 'foo')) {
                updateAttributeInMarkup(this, 'divRef1', 'dataFoo', this.foo);
            }
            if (isDirty(this, 'exp2')) {
                updateRefComponetAttribute(this, 'buttonRef3', 'value', this.exp1);
            }
            if (isDirty(this, 'label1')) {
                updateContentInMarkup(this, 'buttonRef1', 'label', this.label1);
            }
            if (isDirty(this, 'label2')) {
                updateRefComponetAttribute(this, 'buttonRef2', this.label2);
                updateRefComponetAttribute(this, 'buttonRef3', this.label2);
            }
            // set values in children refs
            if (isDirty(this, 'exp1')) {
                unmountRefComponent(this, 'divRef2');
                unmountRefComponent(this, 'buttonRef2');
                mountComponentAfterMarker(this, 'if1', renderIf1());
            }
            componentWasRehydrated(this);
        };
        const renderIf1 = () => {
            if (this.exp1) {
                return virtual('div', {__ref: "divRef2", __expPath: "if1"}, [
                    virtual('button', {__ref: "buttonRef1"}, [this.label1]),
                ]);
            } else {
                return superbutton({__ref: "buttonRef2", __expPath: "else", label: this.label2});
            }
        };
        const render = () => {
            // compiled version of render()
            return virtual('div', {__ref: "divRef1", dataFoo: this.foo}, [
                marker('if1'),
                renderIf1(),
                virtual('input', {__ref: "buttonRef3", value: this.foo2x, onChange: (e) => this.onChange(e), label: this.label2}),
            ]);
        };
        return isDirty(this) ? rehydrate() : render();
    }
    onChange(e) {
        this.set('foo', e.target.value);
    }
}
