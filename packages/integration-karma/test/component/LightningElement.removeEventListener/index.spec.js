import { LightningElement, api } from 'lwc';
import { createElement } from 'test-utils';

it('should remove existing event listeners', () => {
    let isInvoked = false;

    class Test extends LightningElement {
        _listener = () => {
            isInvoked = true;
        }

        connectedCallback() {
            this.addEventListener('click', this._listener);
            this.removeEventListener('click', this._listener);
        }
    }
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    elm.click();

    expect(isInvoked).toBe(false);
});

it('should log an error message when removing a non existing event handler', () => {
    class Test extends LightningElement {
        connectedCallback() {
            this.removeEventListener('click', () => {});
        }
    }
    const elm = createElement('x-test', { is: Test });

    spyOn(console, 'error');
    document.body.appendChild(elm);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error.calls.argsFor(0)[0]).toMatch(
            /\[LWC error\]: Did not find event listener for event "click" executing removeEventListener on \[object HTMLElement\]. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback\(\) hook and remove them in the disconnectedCallback\(\) hook./
    );
});
