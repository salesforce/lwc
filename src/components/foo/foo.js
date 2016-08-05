import {
    AuraComponent,
} from "aura";

export default class extends AuraComponent {
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
    render() {
        return <div dataFoo={this.foo}>
            {if (this.bar === 1 || this.bar === 2) {
                <div>
                    <button>{this.label1}</button>
                </div>
            } else {
                <Superbutton label={this.label2} />
            }}
            <input value={this.foo * 2} onChange={(e) => this.onChange(e)} label={this.label2} />
        </div>
    }
    onChange(e) {
        this.set('foo', e.target.value);
    }
}

// this is the object produced by the compilation.
// this object will not be expose to user-land, only used by the render engine
// as a complement of the component instance.
{
    shouldComponentUpdate(componentInstance) {
        // this should be produced by the transpilation, and should be only visible to aura fw
        // update the dom for attributes that are used locally
        // invariant: this process is side-effect free on the component state
        if (isDirty(componentInstance, 'foo')) {
            updateAttributeInMarkup(componentInstance, 'divRef1', 'dataFoo', componentInstance.foo);
        }
        if (isDirty(componentInstance, 'exp2')) {
            updateRefComponetAttribute(componentInstance, 'buttonRef3', 'value', evaluateExp1(componentInstance));
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
            unmountRefComponent(componentInstance, 'divRef2', expPath);
            unmountRefComponent(componentInstance, 'buttonRef2', expPath);
            mountComponentAfterMarker(componentInstance, 'if1', this.__compiledIf1(componentInstance));
        }
        componentWasRehydrated(componentInstance);
        return false;
    }
    get evaluateExp1(componentInstance) {
        return (componentInstance.bar === 1 || componentInstance.bar === 2);
    }
    get evaluateExp2(componentInstance) {
        return componentInstance.bar * 2;
    }
    __compiledIf1(componentInstance) {
        if (evaluateExp1(componentInstance)) {
            return v('div', {__ref: "divRef2", __expPath: "if1"}, [
                v('button', {__ref: "buttonRef1"}, [componentInstance.label1]),
            ]);
        } else {
            return Superbutton({__ref: "buttonRef2", __expPath: "else", label: componentInstance.label2});
        }
    };
    __compiledRender(componentInstance) {
        // compiled version of render()
        return v('div', {__ref: "divRef1", dataFoo: componentInstance.foo}, [
            m('if1'),
            this.__compiledIf1(componentInstance),
            v('input', {__ref: "buttonRef3", value: this.evaluateExp2(componentInstance), onChange: (e) => componentInstance.onChange(e), label: componentInstance.label2}),
        ]);
    }
}
