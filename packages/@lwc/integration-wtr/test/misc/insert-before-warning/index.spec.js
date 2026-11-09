describe('Node.prototype.insertBefore patch', () => {
    // The engine monkey-patches the global `Node.prototype.insertBefore` for synthetic lifecycle.
    it('should log a warning when insertBefore is called with fewer than 2 arguments', () => {
        const div = document.createElement('div');
        const span = document.createElement('span');

        expect(() => {
            div.insertBefore(span);
        }).toLogWarningDev(
            /insertBefore should be called with 2 arguments. Calling with only 1 argument is not supported./
        );
    });
});
