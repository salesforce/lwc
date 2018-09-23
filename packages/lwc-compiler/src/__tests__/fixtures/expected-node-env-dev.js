import { LightningElement } from 'lwc';
var stylesheet = {
    hostToken: 'styled-x-c715c-host',
    shadowToken: 'styled-x-c715c',
    content:
        '[styled-x-c715c-host]{color:blue}div[styled-x-c715c]{color:red}x-foo[styled-x-c715c],[is="x-foo"][styled-x-c715c]{color:green}',
};

function tmpl($api, $cmp, $slotset, $ctx) {
    return [];
}
if (stylesheet) {
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
