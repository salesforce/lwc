const assert = require('assert');
describe('Event.defaultPrevented', () => {
    const URL = 'http://localhost:4567/default-prevented';

    before(() => {
        browser.url(URL);
    });

    it('should set defaultPrevented to true when calling preventDefault() on event', () => {
        const element = browser.element('x-child span');
        element.click();

        const defaultPreventedIndicator = browser.element('#default-prevented-event');
        assert.deepEqual(defaultPreventedIndicator.getText(), 'Received defaultPrevented event from: child');
    });

    it('should allow to call multiple times preventDefault() on the same event', () => {
        const element = browser.element('x-grand-child span');
        element.click();

        const defaultPreventedIndicator = browser.element('#default-prevented-event');
        assert.deepEqual(defaultPreventedIndicator.getText(), 'Received defaultPrevented event from: grand-child');
    });
});
