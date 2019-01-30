import { LightningElement, api } from 'lwc';
import { createElement } from 'test-utils';

it('should rely on the constructor name', () => {
    class MyFancyComponent extends LightningElement {
        @api
        getToString() {
            return String(this);
        }
    }

    const elm = createElement('x-fancy-component', { is: MyFancyComponent });
    expect(elm.getToString()).toBe('[object MyFancyComponent]');
});

// TODO - open issue return "[object ]" on Safari
xit('should fallback to BaseLightningElement if constructor has no name', () => {
    const elm = createElement('x-no-name', {
        is: class extends LightningElement {
            @api
            getToString() {
                return String(this);
            }
        },
    });
    expect(elm.getToString()).toBe('[object BaseLightningElement]');
});
