// Patch missing HTMLElement.prototype.draggable property in JSDOM.
// Issue: https://github.com/jsdom/jsdom/issues/2268
if (!('draggable' in HTMLElement.prototype)) {
    Object.defineProperty(HTMLElement.prototype, 'draggable', {
        get() {
            return this.getAttribute('draggable');
        },
        set(value) {
            this.setAttribute('draggable', value);
        },
        configurable: true,
    });
}
