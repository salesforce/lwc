const assert = require('assert');

describe('Web Component reflection', () => {
    const URL = 'http://localhost:4567/wc-attribute-reflection';

    before(() => {
        browser.url(URL);
    });

    it('should reflect all attributes during initialization', () => {
        const {
            value: {
                attrs,
                props,
            },
        } = browser.execute(() => {
            var element = document.querySelector('wc-attribute-reflection').programmatic;
            return {
                attrs: {
                    title: element.getAttribute('title'),
                    x: element.getAttribute('x'),
                },
                props: {
                    title: element.title,
                    x: element.x,
                },
            };
        });

        assert.equal(attrs.title, 'something');
        assert.equal(attrs.x, '2');
        assert.equal(props.title, 'something');
        assert.equal(props.x, 2);
    });

    it('should not reflect custom props when changed from within', () => {
        const {
            value: {
                attrs,
                props,
            },
        } = browser.execute(() => {
            var element = document.querySelector('wc-attribute-reflection').programmatic;
            element.run();
            return {
                attrs: {
                    title: element.getAttribute('title'),
                    x: element.getAttribute('x'),
                },
                props: {
                    title: element.title,
                    x: element.x,
                },
            };
        });

        assert.equal(attrs.title, 'else');
        assert.equal(attrs.x, '3');
        assert.equal(props.title, 'else');
        assert.equal(props.x, 2);
    });

    it('should reflect all attributes when changed from outside', () => {
        const {
            value: {
                attrs,
                props,
            },
        } = browser.execute(() => {
            var element = document.querySelector('wc-attribute-reflection').programmatic;
            element.setAttribute('x', 4);
            element.setAttribute('title', 'cubano');
            return {
                attrs: {
                    title: element.getAttribute('title'),
                    x: element.getAttribute('x'),
                },
                props: {
                    title: element.title,
                    x: element.x,
                },
            };
        });

        assert.equal(attrs.title, 'cubano');
        assert.equal(attrs.x, '4');
        assert.equal(props.title, 'cubano');
        assert.equal(props.x, 4);
    });
});
