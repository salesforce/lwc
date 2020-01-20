import { LightningElement, api } from 'lwc';

export default class WireContextAdapter extends LightningElement {
    @api context;

    provideContextValue(contextEvent) {
        contextEvent.detail.callback(this.context);
    }
}
