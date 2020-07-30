import { LightningElement, api } from 'lwc';

export default class App extends LightningElement {
    @api testStatus;
    @api testMessage;
    renderedCallback() {
        if (this.handled) {
            return;
        }

        window.addEventListener('mouseout', (event) => {
            try {
                this.testMessage = event.relatedTarget;
                this.testStatus = 'OK';
            } catch (e) {
                this.testMessage = e.message;
                this.testStatus = 'error';
            }
        });
    }
}
