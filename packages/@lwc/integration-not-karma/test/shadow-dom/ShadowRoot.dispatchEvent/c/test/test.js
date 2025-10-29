import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    logs = [];

    @api
    getLogs() {
        return this.logs;
    }

    @api
    addLog(value) {
        this.logs.push(value);
    }

    @api
    rootDispatchEvent(eventInit) {
        this.template.dispatchEvent(new CustomEvent('test', eventInit));
    }

    connectedCallback() {
        this.addEventListener('test', () => {
            this.logs.push('listen-on-host-from-instance');
        });
        this.template.addEventListener('test', () => {
            this.logs.push('listen-on-root-from-instance');
        });
    }
}
