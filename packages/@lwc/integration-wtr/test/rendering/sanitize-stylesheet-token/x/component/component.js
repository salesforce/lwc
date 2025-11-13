import { LightningElement, api } from 'lwc';
import template from './component.html';

export default class Component extends LightningElement {
    @api propToUse;

    count = 0;

    render() {
        const token = {
            [Symbol.toPrimitive]: () => {
                if (this.count === 0) {
                    return `yolo-${++this.count}`;
                } else {
                    return `yolo=yolo-${++this.count}`;
                }
            },
        };

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
