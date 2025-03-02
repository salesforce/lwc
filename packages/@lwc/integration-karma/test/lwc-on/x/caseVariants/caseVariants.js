import { LightningElement, api } from 'lwc';

/* eslint-disable no-console */
const lowercase = {
    lowercase: function () {
        console.log('lowercase handler called');
    },
};

const kebab_case = {
    'kebab-case': function () {
        console.log('kebab-case handler called');
    },
};

const camelCase = {
    camelCase: function () {
        console.log('camelCase handler called');
    },
};

const CAPSCASE = {
    CAPSCASE: function () {
        console.log('CAPSCASE handler called');
    },
};

const PascalCase = {
    PascalCase: function () {
        console.log('PascalCase handler called');
    },
};

const empty_string = {
    '': function () {
        console.log('empty string handler called');
    },
};
/* eslint-enable no-console */

export default class CaseVariants extends LightningElement {
    @api propCase;

    get eventHandlers() {
        switch (this.propCase) {
            case 'lower':
                return lowercase;
            case 'kebab':
                return kebab_case;
            case 'camel':
                return camelCase;
            case 'caps':
                return CAPSCASE;
            case 'pascal':
                return PascalCase;
            case 'empty':
                return empty_string;
            default:
                return {};
        }
    }
}
