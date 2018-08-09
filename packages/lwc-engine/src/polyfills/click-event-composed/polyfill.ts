import { addEventListener, removeEventListener } from '../../framework/dom-api';

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
        addEventListener.call(this, 'click', handleClick, true);
        originalClickDescriptor!.value!.call(this);
        removeEventListener.call(this, 'click', handleClick, true);
    };
}
