import { LightningElement } from 'lwc';
import tmpl from './explicitRender.html';

export default class ExplicitRender extends LightningElement {
    render() {
        return tmpl;
    }
}
