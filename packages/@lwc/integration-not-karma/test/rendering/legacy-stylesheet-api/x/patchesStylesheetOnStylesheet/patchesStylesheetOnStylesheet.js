import { LightningElement } from 'lwc';
import a from './a.html';
import b from './b.html';

export default class extends LightningElement {
    render() {
        // patch stylesheets onto the template with its own stylesheets
        a.stylesheets = b.stylesheets;
        a.stylesheetToken = b.stylesheetToken;
        return a;
    }
}
