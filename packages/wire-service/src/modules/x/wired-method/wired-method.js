import { Element } from 'engine';

export default class WiredMethod extends Element {
    @api propName;
    @track state = {};
    @wire('test', { propName: '$propName', fields: ['Name'] })
    wiredMethod(err, data) {
        if (err) {
            this.state.error = err;
            this.state.Name = undefined;
        } else {
            this.state.Name = data.Name;
            this.state.error = undefined;
        }
    }
}
