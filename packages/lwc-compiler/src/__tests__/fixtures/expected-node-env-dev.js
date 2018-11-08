import { registerTemplate, registerComponent, LightningElement } from 'lwc';
function tmpl($api, $cmp, $slotset, $ctx) {
    return [];
}
var _tmpl = registerTemplate(tmpl);
class ClassAndTemplate extends LightningElement {
    connectedCallback() {
        {
            this.root.querySelector('insideOfProductionCheck');
        }
        this.root.querySelector('outsideOfProductionCheck');
    }
}
var node_env = registerComponent(ClassAndTemplate, {
    tmpl: _tmpl
});
export default node_env;
