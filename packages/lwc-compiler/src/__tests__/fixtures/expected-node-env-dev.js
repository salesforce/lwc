import { LightningElement } from 'lwc';
const style = undefined;
function tmpl($api, $cmp, $slotset, $ctx) {
    return [];
}
if (style) {
    tmpl.hostToken = style.hostToken;
    tmpl.shadowToken = style.shadowToken;
    const style$$1 = document.createElement('style');
    style$$1.type = 'text/css';
    style$$1.dataset.token = style.shadowToken;
    style$$1.textContent = style.content;
    document.head.appendChild(style$$1);
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
