describe('EventTarget.dispatchEvent', () => {
    let node;
    beforeEach(() => {
        node = document.createElement('button');
        document.body.appendChild(node);
    });
    it('should return true when "Event.preventDefault" is not invoked', () => {
        node.addEventListener('custom-event', () => {});
        const result = node.dispatchEvent(new Event('custom-event'));

        expect(result).toBeTrue();
    });

    it('should return false when "Event.preventDefault" is invoked', () => {
        node.addEventListener('custom-event', (e) => {
            e.preventDefault();
        });
        const result = node.dispatchEvent(new Event('custom-event', { cancelable: true }));

        expect(result).toBeFalse();
    });

    it('should throw error when invoked with non-event object', () => {
        expect(() => node.dispatchEvent(1)).toThrowError();
    });

    it('should return false when "Event.preventDefault" is invoked on non-node EventTarget', () => {
        const target = new EventTarget();
        target.addEventListener('custom-event', (e) => {
            e.preventDefault();
        });
        const result = target.dispatchEvent(new Event('custom-event', { cancelable: true }));

        expect(result).toBeFalse();
    });

    it('should return true when "Event.preventDefault" is invoked on non-node EventTarget', () => {
        const target = new EventTarget();
        target.addEventListener('custom-event', () => {});
        const result = target.dispatchEvent(new Event('custom-event', { cancelable: true }));

        expect(result).toBeTrue();
    });
});
