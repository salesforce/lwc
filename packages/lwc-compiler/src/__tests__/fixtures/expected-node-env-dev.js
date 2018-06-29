import { Element } from 'engine';
const style = undefined;
function tmpl($api, $cmp, $slotset, $ctx) {
    return [];
}
if (style) {
    tmpl.hostToken = 'x-node_env_node_env-host';
    tmpl.shadowToken = 'x-node_env_node_env';
    const style$$1 = document.createElement('style');
    style$$1.type = 'text/css';
    style$$1.dataset.token = 'x-node_env_node_env';
    style$$1.textContent = style('x-node_env_node_env');
    document.head.appendChild(style$$1);
}
class ClassAndTemplate extends Element {
    connectedCallback() {
        {
            this.root.querySelector('insideOfProductionCheck');
        }
        this.root.querySelector('outsideOfProductionCheck');
    }
    render() {
        return tmpl;
    }
}
export default ClassAndTemplate;
