import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api notWhitelisted;
    @api templateExpression;
    @api label;
    @api value;

    @api fireToggleSectionCollapsedEvent() {
        this.dispatchEvent(
            new CustomEvent('togglesectioncollapsed', {
                bubbles: true,
                composed: true,
            })
        );
    }
}
