import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    get testElement() {
        return this.template.querySelector('x-test');
    }

    handleTest() {
        this.testElement.addLog('listen-on-host-from-template');
    }

    @api
    getLogs() {
        return this.testElement.getLogs();
    }

    @api
    rootDispatchEvent(eventInit) {
        this.testElement.rootDispatchEvent(eventInit);
    }

    renderedCallback() {
        this.testElement.addEventListener('test', () => {
            this.testElement.addLog('listen-on-host-from-element');
        });
        this.testElement.shadowRoot.addEventListener('test', () => {
            this.testElement.addLog('listen-on-root-from-element');
        });
    }
}
