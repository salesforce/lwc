import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static preferNativeShadow = true;

    @api
    setInnerHtmlOnShadowRoot() {
        this.template.innerHTML = '<div></div>';
    }

    @api
    setTextContentOnShadowRoot() {
        this.template.textContent = 'foo';
    }

    @api
    addEventListenerWithOptions() {
        this.template.addEventListener('scroll', () => {}, { passive: true });
    }

    @api
    getTagName() {
        return this.tagName;
    }

    @api
    dispatchEventWithInvalidName() {
        this.dispatchEvent(new CustomEvent('UPPERCASE-AND-HYPHENS'));
    }

    @api
    getClassName() {
        return this.className;
    }

    @api
    setAccessKeyLabel(accessKeyLabel) {
        this.accessKeyLabel = accessKeyLabel;
    }
}
