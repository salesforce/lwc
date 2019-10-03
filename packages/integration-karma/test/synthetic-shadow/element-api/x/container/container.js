import { LightningElement, createElement } from 'lwc';
import SlotContainer from 'x/slotContainer';

export default class Container extends LightningElement {
    renderedCallback() {
        const templateDiv = this.template.querySelector('div');
        const createdDiv = document.createElement('div');
        createdDiv.classList.add('manual-ctx');

        const cmp = createElement('x-manually-inserted', { is: SlotContainer });
        createdDiv.appendChild(cmp);

        // this.template.insertBefore(createdDiv, lastParagraph);
        templateDiv.insertBefore(createdDiv);
    }
}
