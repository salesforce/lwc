import { registerTemplate, registerComponent, LightningElement } from 'lwc';

function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        t: api_text
    } = $api;
    return [api_text("ts test")];
}

var _tmpl = registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetTokens = {
    hostAttribute: "x-typescript.ts_typescript-host",
    shadowAttribute: "x-typescript.ts_typescript"
};
const Test = 1;
class ClassAndTemplate extends LightningElement {
    constructor() {
        super();
        this.t = Test;
        this.counter = 0;
    }
}
var typescript = registerComponent(ClassAndTemplate, {
    tmpl: _tmpl
});
export default typescript;