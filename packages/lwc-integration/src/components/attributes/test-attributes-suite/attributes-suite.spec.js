const assert = require('assert');

describe('test pre dom-insertion setAttribute and removeAttribute functionality', () => {
    const URL = 'http://localhost:4567/attributes/attributesSuite';

    before(() => {
        browser.url(URL);

    });

    it('should set user defined attribute value', () => {
        const childElm = browser.element('my-child');
        assert.equal(childElm.getAttribute('title'), 'im child title');

        // verify via element
        const titleAttrDivElm = browser.element('#titleattr');
        assert.equal(titleAttrDivElm.getText(), 'im child title');
    }),

    it('should remove user specified attribute', () => {
        const childElm = browser.element('my-child');
        assert.notEqual(childElm.getAttribute('tabindex'), '4');

        // verify via element
        const tabAttrElm = browser.element('#tabindexattr');
        assert.notEqual(tabAttrElm.getText(), '4');
    })
})
