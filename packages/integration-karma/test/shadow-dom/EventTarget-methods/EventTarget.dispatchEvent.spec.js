describe('EventTarget.dispatchEvent', () => {
    it('should return true when "Event.preventDefault" is not invoked', () => {
        const target = new EventTarget();
        target.addEventListener('custom-event', () => {});
        const result = target.dispatchEvent(new Event('custom-event'));

        expect(result).toBeTrue();
    });

    it('should return false when "Event.preventDefault" is invoked', () => {
        const target = new EventTarget();
        target.addEventListener('custom-event', (e) => {
            e.preventDefault();
        });
        const result = target.dispatchEvent(new Event('custom-event', { cancelable: true }));

        expect(result).toBeFalse();
    });

    it('should throw error when invoked with non-event object', () => {
        const target = new EventTarget();
        expect(() => target.dispatchEvent(1)).toThrowError();
    });
});
