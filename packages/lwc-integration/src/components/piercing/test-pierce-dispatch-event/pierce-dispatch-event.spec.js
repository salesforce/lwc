const assert = require('assert');
describe('Event dispatch piercing', () => {
    const URL = 'http://localhost:4567/pierce-dispatch-event';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should have pierced and dispatched a non-custom even correctly', function () {
        const el = browser.element('#event-count');
        assert(el.getText(), 'Event Count: 1');
    });
});
