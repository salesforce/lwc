import { createElement } from 'lwc';
import Test from 'x/test';

if (process.env.COMPAT) {
    it('should fallback to id-mangling (static)', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        const div = elm.shadowRoot.querySelector('.shizuoka');
        const input = elm.shadowRoot.querySelector('.idref-static');

        expect(div.id).toMatch(/^shizuoka-\w+$/);
        expect(input.ariaDescribedBy).toContain(div.id);
    });

    it('should fallback to id-mangling (dynamic)', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        const div = elm.shadowRoot.querySelector('.yamanashi');
        const input = elm.shadowRoot.querySelector('.idref-dynamic');

        expect(div.id).toMatch(/^yamanashi-\w+$/);
        expect(input.ariaLabelledBy).toContain(div.id);
    });
} else {
    it('should entrust id scoping to native shadow (static)', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        const div = elm.shadowRoot.querySelector('#shizuoka');
        expect(div).not.toBeNull();
    });

    it('should entrust id scoping to native shadow (dynamic)', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        const div = elm.shadowRoot.querySelector('#yamanashi');
        expect(div).not.toBeNull();
    });

    it('should entrust idref scoping to native shadow (static)', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        const input = elm.shadowRoot.querySelector('[aria-describedby="shizuoka yamanashi"]');
        expect(input).not.toBeNull();
    });

    it('should entrust idref scoping to native shadow (dynamic)', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        const input = elm.shadowRoot.querySelector('[aria-labelledby="yamanashi shizuoka"]');
        expect(input).not.toBeNull();
    });
}
