import { api, LightningElement } from 'lwc';
import withStylesheet from './withStylesheet.html';
import withoutStylesheet from './withoutStylesheet.html';

export default class extends LightningElement {
    @api get withStylesheet() {
        return withStylesheet;
    }

    @api get withoutStylesheet() {
        return withoutStylesheet;
    }
}
