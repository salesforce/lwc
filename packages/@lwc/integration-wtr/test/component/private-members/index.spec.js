import { createElement } from 'lwc';
import PrivateField from 'x/privateField';
import MultiplePrivateFields from 'x/multiplePrivateFields';

// These tests verify that private fields no longer throw LWC1214.
// Previously, private fields would throw:
// "LWC1214: Private fields are not currently supported. Only private methods are supported."
describe('private fields', () => {
    it('should compile and run with a single private field', () => {
        const elm = createElement('x-private-field', { is: PrivateField });
        document.body.appendChild(elm);

        expect(elm.getCount()).toBe(0);
        elm.increment();
        expect(elm.getCount()).toBe(1);
        elm.increment();
        expect(elm.getCount()).toBe(2);
    });

    it('should compile and run with multiple private fields', () => {
        const elm = createElement('x-multiple-private-fields', {
            is: MultiplePrivateFields,
        });
        document.body.appendChild(elm);

        const data = { foo: 'bar' };
        elm.setData(data);

        expect(elm.getData()).toEqual(data);
        expect(elm.isDirty()).toBe(true);
    });
});
