const assert = require('assert');

describe('Web Component reflection', () => {
    const URL = 'http://localhost:4567/wc-attribute-suite';

    before(() => {
        browser.url(URL);
    });

    it('should reflect all attributes during initialization', () => {
        const element = browser.element('wc-attribute-suite');
        const { programmatic } = element;
        assert.equal(programmatic.getAttribute('title'), 'something');
        assert.equal(programmatic.getAttribute('x'), '2');
        assert.equal(programmatic.title, 'something');
        assert.equal(programmatic.x, 2);
    });

    it('should not reflect custom props when changed from within', () => {
        const element = browser.element('wc-attribute-suite');
        const { programmatic } = element;
        programmatic.run();
        assert.equal(programmatic.getAttribute('title'), 'else');
        assert.equal(programmatic.getAttribute('x'), '3');
        assert.equal(programmatic.title, 'else');
        assert.equal(programmatic.x, 2);
    });

    it('should reflect all attributes when changed from outside', () => {
        const element = browser.element('wc-attribute-suite');
        const { programmatic } = element;
        programmatic.setAttribute('x', 4);
        programmatic.setAttribute('title', 'cubano');
        assert.equal(programmatic.getAttribute('title'), 'cubano');
        assert.equal(programmatic.getAttribute('x'), '4');
        assert.equal(programmatic.title, 'cubano');
        assert.equal(programmatic.x, 4);
    });

});
