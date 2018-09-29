import { LightningElement } from 'lwc';
const style = undefined;
function tmpl($api, $cmp, $slotset, $ctx) {
    return [];
}
if (style) {
    tmpl.stylesheet = style;
}
class ClassAndTemplate extends LightningElement {
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
