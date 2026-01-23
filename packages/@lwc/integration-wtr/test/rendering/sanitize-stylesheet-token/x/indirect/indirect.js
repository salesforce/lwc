import { LightningElement, api } from 'lwc';
import template from './indirect.html';

export default class Indirect extends LightningElement {
    @api propToUse;

    render() {
        const token = 'stylesheet.token';

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

Indirect.resetTemplate = () => {
    Object.assign(template, {
        stylesheetToken,
        stylesheetTokens,
        legacyStylesheetToken,
    });
};
