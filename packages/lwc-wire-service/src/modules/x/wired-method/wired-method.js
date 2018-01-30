import { Element, api, track, wire } from 'engine';

export default class WiredMethod extends Element {
    @api propName;
    @track state = {};
    @wire('test', { propName: '$propName', fields: ['Name'] })
    wiredMethod({error, data}) {
        if (error) {
            this.state.error = error;
            this.state.Name = undefined;
        } else {
            this.state.Name = data.Name;
            this.state.error = undefined;
        }
    }
}
