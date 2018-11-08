const pluginTestFactory = require('./utils/test-transform').pluginTest;
const pluginTestImplicit = pluginTestFactory(require('../index'), { isExplicitImport: false });

describe('Transform property', () => {
    pluginTestImplicit('implicit test', `
        import { LightningElement } from 'lwc';
        export default class Test extends LightningElement {
        }
    `, {
        output: {
            code: `x`
        }
    });
});
