import { registerTemplate, registerComponent, LightningElement, registerDecorators } from 'lwc';
import { load } from '@custom/loader';

function tmpl($api, $cmp, $slotset, $ctx) {
    const {dc: api_dynamic_component, f: api_flatten} = $api;
    return api_flatten([api_dynamic_component("x-foo", $cmp.customCtor, {
            key: 0
        }, [])]);
    }
var _tmpl = registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetTokens = {
    hostAttribute: "x-dynamic_imports_dynamic_imports-host",
    shadowAttribute: "x-dynamic_imports_dynamic_imports"
    };
class DynamicCtor extends LightningElement {
    constructor(...args) {
        super(...args);
        this.customCtor = void 0;
    }
    connectedCallback() {
        this.loadCtor();
    }
    async loadCtor() {
        const ctor = await load("foo");
    this.customCtor = ctor;
    }
}
registerDecorators(DynamicCtor, {
    track: {
        customCtor: 1
    }
});
var dynamic_imports = registerComponent(DynamicCtor, {
    tmpl: _tmpl
});
export default dynamic_imports;