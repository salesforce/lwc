import { LightningElement, registerDirective, Directive } from 'lwc';

class RefDirective extends Directive {
    callback;
    constructor(callback) {
        super();
        this.callback = callback;
    }
    renderedCallback(el) {
        this.callback(el);
    }
}

registerDirective('ref', RefDirective);

export default class Sample extends LightningElement {
    ref;
    setRef = (elm) => {
        this.ref = elm;
    };

    renderedCallback() {
        console.log(this.ref.innerText);
    }
}
