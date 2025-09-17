import { LightningElement, api } from 'lwc';

let testFn;

const lowercase = {
    lowercase: function () {
        testFn('lowercase handler called');
    },
};

const kebab_case = {
    'kebab-case': function () {
        testFn('kebab-case handler called');
    },
};

const camelCase = {
    camelCase: function () {
        testFn('camelCase handler called');
    },
};

const CAPSCASE = {
    CAPSCASE: function () {
        testFn('CAPSCASE handler called');
    },
};

const PascalCase = {
    PascalCase: function () {
        testFn('PascalCase handler called');
    },
};

const empty_string = {
    '': function () {
        testFn('empty string handler called');
    },
};

export default class CaseVariants extends LightningElement {
    @api propCase;

    @api
    get testFn() {
        return testFn;
    }
    set testFn(val) {
        testFn = val;
    }

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
