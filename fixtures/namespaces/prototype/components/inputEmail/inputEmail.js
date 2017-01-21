import { HTMLElement } from "raptor";
import html from "./inputEmail.html";

export default class input extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('input', this.handleInput.bind(this));
    }

    placeholder = 'default';
    value;

    handleInput (originalEvent: Event) {
        const event = document.createEvent('CustomEvent');
        event.initCustomEvent('change', true, true, null);
        // const event = new CustomEvent('change', {
        //     bubbles: true,
        //     cancelable: true,
        //     detail: {
        //         value: originalEvent.currentTarget.value,
        //     },
        // });
        this.dispatchEvent(event);
    }

    render() {
        return html;
    }
}
