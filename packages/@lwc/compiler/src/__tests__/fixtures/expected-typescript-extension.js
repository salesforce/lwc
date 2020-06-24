import { registerTemplate, registerComponent, LightningElement, registerDecorators } from 'lwc';

function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        t: api_text
    } = $api;
    return [api_text("ts test", 0)];
}

var _tmpl = registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetTokens = {
    hostAttribute: "x-typescript_typescript-host",
    shadowAttribute: "x-typescript_typescript"
};
const Test = 1;
class ClassAndTemplate extends LightningElement {
    constructor() {
        super();
        this.t = Test;
        this.counter = 0;
    }
}
registerDecorators(ClassAndTemplate, {
    fields: ["t"]
});
var typescript = registerComponent(ClassAndTemplate, {
    tmpl: _tmpl
});
export default typescript;