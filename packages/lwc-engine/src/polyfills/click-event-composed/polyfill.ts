const { addEventListener, removeEventListener } = Element.prototype;
const originalClickDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'click');

function handleClick(event) {
    Object.defineProperty(event, 'composed', {
        configurable: true,
        enumerable: true,
        get() {
            return true;
        }
    });
}

export default function apply() {
    HTMLElement.prototype.click = function() {
        addEventListener.call(this, 'click', handleClick);
        try {
            originalClickDescriptor!.value!.call(this);
        } catch (ex) {
            throw ex;
        } finally {
            removeEventListener.call(this, 'click', handleClick);
        }
    };
}
