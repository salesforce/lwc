import { LightningElement, api } from 'lwc';

let testClick;

const lowercase = {
    lowercase: function () {
        testClick('lowercase handler called');
    },
};

const kebab_case = {
    'kebab-case': function () {
        testClick('kebab-case handler called');
    },
};

const camelCase = {
    camelCase: function () {
        testClick('camelCase handler called');
    },
};

const CAPSCASE = {
    CAPSCASE: function () {
        testClick('CAPSCASE handler called');
    },
};

const PascalCase = {
    PascalCase: function () {
        testClick('PascalCase handler called');
    },
};

const empty_string = {
    '': function () {
        testClick('empty string handler called');
    },
};

export default class CaseVariants extends LightningElement {
    @api propCase;

    @api
    get testClick() {
        return testClick;
    }
    set testClick(val) {
        testClick = val;
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
