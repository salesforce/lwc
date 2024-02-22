import { createElement } from 'lwc';
import Parent from 'x/parent';

// https://github.com/salesforce/lwc/issues/4011
describe('native inside synthetic', () => {
    it('should have shadowed elements in composed path when inside shadow boundary', () => {
        const element = createElement('x-parent', { is: Parent });
        element.setAttribute('x-parent');
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            element.click();

            expect(element.childComposedPath).toEqual([
                jasmine.any(HTMLElement),
                jasmine.any(HTMLElement),
                jasmine.any(HTMLElement),
                jasmine.any(Object), // #document-fragment for closed shadow root
                element.child,
                element.shadowRoot,
                element,
                document.body,
                document.documentElement,
                document,
                window,
            ]);
        });
    });

    it('should not have shadowed elements in composed path when outside shadow boundary', () => {
        const element = createElement('x-parent', { is: Parent });
        element.setAttribute('x-parent');
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            element.click();
            expect(element.parentComposedPath).toEqual([
                element.child,
                element.shadowRoot,
                element,
                document.body,
                document.documentElement,
                document,
                window,
            ]);
        });
    });
});
