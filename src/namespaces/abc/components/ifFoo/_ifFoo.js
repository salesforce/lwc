import {
    AuraComponent,
} from "aura";

import {
    virtual,
    marker,
} from "aura:component";

import {
    isDirty,
    updateAttributeInMarkup,
    updateRefComponetAttribute,
    updateContentInMarkup,
    unmountRefComponent,
    mountComponentAfterMarker,
    componentWasRehydrated,
} from "aura:rendering";

import {
    Compiled as superbutton,
} from "mynamespace:superbutton"

export class Compiled extends AuraComponent {
    get label1() {
        return 'first';
    }
    get label2() {
        this.counter++;
        return 'second';
    }
    get foo() {
        return 1;
    }
    get bar() {
        return 2;
    }
    render() {
        // this is the object produced by the compilation.
        // this object will not be expose to user-land, only used by the render engine
        // as a complement of the component instance.
        return {
            shouldComponentBeRendered(componentInstance) {
                // this should be produced by the transpilation, and should be only visible to aura fw
                // update the dom for attributes that are used locally
                // invariant: this process is side-effect free on the component state
                if (isDirty(componentInstance, 'foo')) {
                    updateAttributeInMarkup(componentInstance, 'divRef1', 'dataFoo', componentInstance.foo);
                }
                if (isDirty(componentInstance, 'exp2')) {
                    updateRefComponetAttribute(componentInstance, 'buttonRef3', 'value', componentInstance.exp1);
                }
                if (isDirty(componentInstance, 'label1')) {
                    updateContentInMarkup(componentInstance, 'buttonRef1', 'label', componentInstance.label1);
                }
                if (isDirty(componentInstance, 'label2')) {
                    updateRefComponetAttribute(componentInstance, 'buttonRef2', componentInstance.label2);
                    updateRefComponetAttribute(componentInstance, 'buttonRef3', componentInstance.label2);
                }
                // set values in children refs
                if (isDirty(componentInstance, 'exp1')) {
                    unmountRefComponent(componentInstance, 'divRef2');
                    unmountRefComponent(componentInstance, 'buttonRef2');
                    mountComponentAfterMarker(componentInstance, 'if1', this.renderIf1(componentInstance));
                }
                componentWasRehydrated(componentInstance);
                return false;
            },
            renderIf1(componentInstance) {
                if (componentInstance.exp1) {
                    return virtual('div', {__ref: "divRef2", __expPath: "if1"}, [
                        virtual('button', {__ref: "buttonRef1"}, [componentInstance.label1]),
                    ]);
                } else {
                    return superbutton({__ref: "buttonRef2", __expPath: "else", label: componentInstance.label2});
                }
            },
            renderComponent(componentInstance) {
                // compiled version of render()
                return virtual('div', {__ref: "divRef1", dataFoo: componentInstance.foo}, [
                    marker('if1'),
                    this.renderIf1(componentInstance),
                    virtual('input', {__ref: "buttonRef3", value: componentInstance.foo2x, onChange: (e) => componentInstance.onChange(e), label: componentInstance.label2}),
                ]);
            }
        };
    }
    onChange(e) {
        this.set('foo', e.target.value);
    }
}
