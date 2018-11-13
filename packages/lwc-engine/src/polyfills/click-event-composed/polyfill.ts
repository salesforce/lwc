export default function apply() {
    HTMLElement.prototype.click = function() {
        const ev = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            composed: true
        });
        this.dispatchEvent(ev);
    };
}
