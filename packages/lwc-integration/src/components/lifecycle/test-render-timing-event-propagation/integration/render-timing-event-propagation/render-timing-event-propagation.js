import { api, track, LightningElement } from 'lwc';

export default class IntegrationRenderTiming extends LightningElement {
    @track
    state = {
        bad: false,
        hideButton: false,
    };

    @api
    click() {
        this.template.querySelector('integration-button').click();
    }

    renderedCallback() {
        this.template.addEventListener('click', () => {
            this.template.querySelector('integration-button').lastClickHandled();
        });
    }

    handleClick() {
        this.state.hideButton = true;
    }

    handleBad() {
        this.state.bad = true;
        this.template.querySelector('integration-button').setAttribute('fail', true);
    }
}
