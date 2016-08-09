import {
    AuraComponent,
} from "aura";

export default class extends AuraComponent {
    constructor() {
        super();
    }
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
    get exp1() {
        return this.bar === 1 || this.bar === 2;
    }
    get foo2x() {
        return this.foo * 2;
    }
    render() {
        return <div dataFoo={this.foo}>
            {if (this.exp1) {
                <div>
                    <button>{this.label1}</button>
                </div>
            } else {
                <superbutton label={this.label2} />
            }}
            <input value={this.foo2x} onChange={(e) => this.onChange(e)} label={this.label2} />
        </div>
    }
    onChange(e) {
        this.set('foo', e.target.value);
    }
}

/*
<div dataFoo="{! v.foo }">
    <aura:if isTrue="{! v.exp1 }">
        <div>
            <button body="{! v.label1 }"></button>
        </div>
    <aura:set name="else">
        <Superbutton label="{! v.label2 }" />
    </aura:set>
    </aura:if>
    <input value.bind="{! v.foox2 }" onChange="{! c.onChange }" label="{! v.label2 }" />
</div>
*/

/*
<div dataFoo.bind="foo">
    {if (this.bar === 1 || this.bar === 2) {
        <div>
            <button body.bind="label1"></button>
        </div>
    } else {
        <Superbutton label.bind="label2" />
    }}
    <input value.bind="foox2" onChange.call="onChange" label.bind="label2" />
</div>
*/
