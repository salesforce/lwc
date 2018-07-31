const assert = require('assert');

describe('Web Component reflection', () => {
    const URL = 'http://localhost:4567/wc-attribute-reflection';

    before(() => {
        browser.url(URL);
    });

    it('should reflect all attributes during initialization', () => {
        const programmaticWc = browser.execute(() => {
            return document.querySelector('wc-attribute-reflection').programmatic;
        });

        assert.equal(programmaticWc.getAttribute('title'), 'something');
        assert.equal(programmaticWc.getAttribute('x'), '2');

        const { value: title } = browser.execute(() => {
            return document.querySelector('wc-attribute-reflection').programmatic.title;
        });

        const { value: x } = browser.execute(() => {
            return document.querySelector('wc-attribute-reflection').programmatic.x;
        });

        assert.equal(title, 'something');
        assert.equal(x, 2);
    });

    // it('should not reflect custom props when changed from within', () => {
    //     const element = browser.element('wc-attribute-reflection');
    //     console.log(element);
    //     const programmatic = element.programmatic;
    //     programmatic.run();
    //     assert.equal(programmatic.getAttribute('title'), 'else');
    //     assert.equal(programmatic.getAttribute('x'), '3');
    //     assert.equal(programmatic.title, 'else');
    //     assert.equal(programmatic.x, 2);
    // });

    // it('should reflect all attributes when changed from outside', () => {
    //     const element = browser.element('wc-attribute-reflection');
    //     const { programmatic } = element;
    //     programmatic.setAttribute('x', 4);
    //     programmatic.setAttribute('title', 'cubano');
    //     assert.equal(programmatic.getAttribute('title'), 'cubano');
    //     assert.equal(programmatic.getAttribute('x'), '4');
    //     assert.equal(programmatic.title, 'cubano');
    //     assert.equal(programmatic.x, 4);
    // });

});
