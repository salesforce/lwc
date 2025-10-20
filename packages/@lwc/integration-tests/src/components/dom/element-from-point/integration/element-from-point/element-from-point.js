import { LightningElement, track } from 'lwc';

export default class ShadowRootFromPoint extends LightningElement {
    @track didSelectCorrectShadowElement = null;
    @track didSelectCorrectDocumentElement = null;

    handleShadowElementFromPointClick() {
        const match = this.template.elementFromPoint(5, 5);
        this.didSelectCorrectShadowElement =
            match === this.template.querySelector('.shadow-element-from-point');
    }

    handleDocumentElementFromPointClick() {
        const match = document.elementFromPoint(5, 5);
        this.didSelectCorrectDocumentElement = match === this.template.host;
    }
}
