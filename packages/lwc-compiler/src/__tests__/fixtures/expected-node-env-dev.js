import { LightningElement } from 'lwc';
const stylesheet = undefined;
function tmpl($api, $cmp, $slotset, $ctx) {
    return [];
}
if (stylesheet) {
    tmpl.stylesheet = stylesheet;
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
