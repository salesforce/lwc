import { registerTemplate, LightningElement } from 'lwc';
function tmpl($api, $cmp, $slotset, $ctx) {
    return [];
}
var _tmpl = registerTemplate(tmpl);
class ClassAndTemplate extends LightningElement {
    connectedCallback() {
        this.root.querySelector('outsideOfProductionCheck');
    }
    render() {
        return _tmpl;
    }
}
export default ClassAndTemplate;
