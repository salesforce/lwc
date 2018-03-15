import { Element } from 'engine';
const style = undefined;
function tmpl($api, $cmp, $slotset, $ctx) {
    return [];
}
if (style) {
    const tagName = 'x-node_env';
    const token = 'x-node_env_node_env';
    tmpl.token = token;
    tmpl.style = style(tagName, token);
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
ClassAndTemplate.style = tmpl.style;
export default ClassAndTemplate;