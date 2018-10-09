import { registerTemplate, LightningElement } from 'lwc';
const style = undefined;
function tmpl($api, $cmp, $slotset, $ctx) {
    return [];
}
var _tmpl = registerTemplate(tmpl);
if (style) {
    tmpl.hostToken = 'x-node_env_node_env-host';
    tmpl.shadowToken = 'x-node_env_node_env';
    const style$$1 = document.createElement('style');
    style$$1.type = 'text/css';
    style$$1.dataset.token = 'x-node_env_node_env';
    style$$1.textContent = style('x-node_env_node_env');
    document.head.appendChild(style$$1);
}
class ClassAndTemplate extends LightningElement {
    connectedCallback() {
        this.root.querySelector('outsideOfProductionCheck');
    }
    render() {
        return _tmpl;
    }
}
export default ClassAndTemplate;
