import applyPolyfill from '../../patch-event/polyfill';

applyPolyfill();

describe('event-composed polyfill', () => {
    it('true by default', () => {
        const focusEvent = new FocusEvent('focus');
        expect(focusEvent.composed).toBe(true);
    });

    it('true when no composed', () => {
        const focusEvent = new FocusEvent('focus', { composed : false });
        expect(focusEvent.composed).toBe(true);
    });
});
