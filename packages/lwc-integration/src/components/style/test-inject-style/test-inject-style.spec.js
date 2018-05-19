const assert = require('assert');

describe('Style injection', () => {
    const URL = 'http://localhost:4567/inject-style';

    before(() => {
        browser.url(URL);
    });

    it(`doens't leak styles on children component`, () => {
        const parentDiv = browser.element('#parent-div');
        const parentColor = parentDiv.getCssProperty('color');
        assert.equal(parentColor.parsed.hex, '#00ff00');

        const childDiv = browser.element('#child-div');
        const childColor = childDiv.getCssProperty('color');
        assert.notEqual(childColor.parsed.hex, '#00ff00');
    });

    it(`injects the style before the component is rendered`, () => {
        const dimensions = browser.getText('#dimensions');
        assert.equal(dimensions, '300x300');
    });
});
