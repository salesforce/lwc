import { HTMLElement } from "raptor";

export default class input extends HTMLElement {
    constructor() {
        super();
    }

    placeholder = 'default';
    value;

    onChangeHandler (originalEvent: Event) {
        const event = document.createEvent('CustomEvent');
        event.initCustomEvent('change', true, true, {
            value: originalEvent.currentTarget.value,
        });
        // const event = new CustomEvent('change', {
        //     bubbles: true,
        //     cancelable: true,
        //     detail: {
        //         value: originalEvent.currentTarget.value,
        //     },
        // });
        this.dispatchEvent(event);
    }
}
