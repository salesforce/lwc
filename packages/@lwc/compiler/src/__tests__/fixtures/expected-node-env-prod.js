import { registerTemplate, registerComponent, LightningElement } from 'lwc';
function tmpl($api, $cmp, $slotset, $ctx) {
    return [];
}
var _tmpl = registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetTokens = {
    hostAttribute: "x-node_env_node_env-host",
    shadowAttribute: "x-node_env_node_env"
};
class ClassAndTemplate extends LightningElement {
    connectedCallback() {
        this.root.querySelector('outsideOfProductionCheck');
    }
}
var node_env = registerComponent(ClassAndTemplate, {
    tmpl: _tmpl
});
export default node_env;
