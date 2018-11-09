import applyPolyfill from '../../patch-event/polyfill';

applyPolyfill();

describe('event-composed polyfill', () => {
    it('should compose true be default', () => {
        const clickEvent = new Event('click');
        expect(clickEvent.composed).toBe(true);
    });
});
