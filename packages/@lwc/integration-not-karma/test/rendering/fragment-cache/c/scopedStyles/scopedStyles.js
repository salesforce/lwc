import { LightningElement } from 'lwc';
import template from '../template/template.html';
import styles from '../stylesheets/scopedStyles.scoped.css';

export default class extends LightningElement {
    static stylesheets = [styles];

    render() {
        return template;
    }
}
