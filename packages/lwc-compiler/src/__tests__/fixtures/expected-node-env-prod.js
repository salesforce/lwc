import { LightningElement } from 'lwc';
const stylesheet = undefined;
function tmpl($api, $cmp, $slotset, $ctx) {
    return [];
}
if (stylesheet) {
    tmpl.hostToken = stylesheet.hostToken;
    tmpl.shadowToken = stylesheet.shadowToken;
    const style = document.createElement('style');
    style.type = 'text/css';
    style.dataset.token = stylesheet.shadowToken;
    style.textContent = stylesheet.content;
    document.head.appendChild(style);
}
class ClassAndTemplate extends LightningElement {
    connectedCallback() {
        this.root.querySelector('outsideOfProductionCheck');
    }
    render() {
        return tmpl;
    }
}
export default ClassAndTemplate;
