import { LightningElement } from 'lwc';
import tmpl from './foobar.html';

export default class HelloWorld extends LightningElement {
    render() {
        // Manually override stylesheets and stylesheetToken for testing purposes
        // eslint-disable-next-line no-eval
        tmpl.stylesheets = [eval];
        tmpl.stylesheetToken = 'alert(document.cookie)';
        return tmpl;
    }
}
