import { Element } from "../main";
import { customElement } from "../wc";

describe('wc', () => {

    it('should create a new constructor from LWCElement', () => {
        class MyComponent extends Element {}
        const WC = customElement(MyComponent);
        expect(typeof WC).toBe('function');
    });

});
