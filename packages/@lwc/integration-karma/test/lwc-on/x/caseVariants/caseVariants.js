import { LightningElement } from 'lwc';

export default class CaseVariants extends LightningElement {
    /* eslint-disable no-console */
    eventHandlers = {
        lowercase: function () {
            console.log('lowercase handler called');
        },
        'kebab-case': function () {
            console.log('kebab-case handler called');
        },
        camelCase: function () {
            console.log('camelCase handler called');
        },
        CAPSCASE: function () {
            console.log('CAPSCASE handler called');
        },
        PascalCase: function () {
            console.log('PascalCase handler called');
        },
        '': function () {
            console.log('empty string handler called');
        },
    };
    /* eslint-enable no-console */
}
