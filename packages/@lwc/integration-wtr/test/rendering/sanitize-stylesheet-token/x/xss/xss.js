import { LightningElement, api } from 'lwc';
import template from './xss.html';

export default class Xss extends LightningElement {
    @api propToUse;

    render() {
        const token = "alert('document.cookie')";

        const { propToUse } = this;
        if (propToUse === 'stylesheetTokens') {
            template[propToUse] = {
                hostAttribute: token,
                shadowAttribute: token,
            };
        } else {
            template[propToUse] = token;
        }

        return template;
    }
}

const { stylesheetToken, stylesheetTokens, legacyStylesheetToken } = template;

Xss.resetTemplate = () => {
    Object.assign(template, {
        stylesheetToken,
        stylesheetTokens,
        legacyStylesheetToken,
    });
};
