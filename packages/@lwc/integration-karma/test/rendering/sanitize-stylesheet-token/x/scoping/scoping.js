import { LightningElement, api } from 'lwc';
import template from './scoping.html';

export default class Component extends LightningElement {
    @api propToUse;

    count = 0;

    render() {
        const token = `foo"yolo="haha`;

        const { propToUse } = this;
        if (propToUse === 'stylesheetTokens') {
            // this legacy format uses an object
            template[propToUse] = {
                hostAttribute: token,
                shadowAttribute: token,
            };
        } else {
            // stylesheetToken or legacyStylesheetToken
            // this format uses a string
            template[propToUse] = token;
        }

        return template;
    }
}

// Reset template object for clean state between tests
const { stylesheetToken, stylesheetTokens, legacyStylesheetToken } = template;

Component.resetTemplate = () => {
    Object.assign(template, {
        stylesheetToken,
        stylesheetTokens,
        legacyStylesheetToken,
    });
};
