import { LightningElement } from 'lwc';
import withStylesheet from './withStylesheet.html';
import withoutStylesheet from './withoutStylesheet.html';

export default class extends LightningElement {
    render() {
        // patch stylesheets onto the template with no stylesheets
        withoutStylesheet.stylesheets = withStylesheet.stylesheets;
        withoutStylesheet.stylesheetToken = withStylesheet.stylesheetToken;
        return withoutStylesheet;
    }
}
