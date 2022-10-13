import { createElement } from 'lwc';
import XComplex from 'x/complex';
import XTest from 'x/test';
import XForEach from 'x/forEach';
import XparentWithNamedSlot from 'x/parentWithNamedSlot';

describe('lwc:if, lwc:elseif, lwc:else directives', () => {
    it('should render if branch if the value for lwc:if is truthy', () => {
        const elm = createElement('x-test', { is: XTest });
        elm.showIf = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.if')).not.toBeNull();
    });

    it('should render elseif branch if the value for lwc:if is falsy and the value for lwc:elseif is truthy', () => {
        const elm = createElement('x-test', { is: XTest });
        elm.showElseif = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.elseif')).not.toBeNull();
    });

    it('should render else branch if the values for lwc:if and lwc:elseif are all falsy', () => {
        const elm = createElement('x-test', { is: XTest });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.else')).not.toBeNull();
    });

    it('should update which branch is rendered if the value changes', () => {
        const elm = createElement('x-test', { is: XTest });
        elm.showIf = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.if')).not.toBeNull();

        elm.showIf = false;
        return Promise.resolve()
            .then(() => {
                expect(elm.shadowRoot.querySelector('.else')).not.toBeNull();
                elm.showElseif = true;
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.elseif')).not.toBeNull();
                elm.showIf = true;
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.if')).not.toBeNull();
            });
    });

    it('should render content when nested inside another if branch', () => {
        const element = createElement('x-complex', { is: XComplex });
        element.showNestedContent = true;
        document.body.appendChild(element);

        expect(element.shadowRoot.querySelector('.nestedContent')).not.toBeNull();
    });

    it('should rerender content when nested inside another if branch', () => {
        const element = createElement('x-complex', { is: XComplex });
        document.body.appendChild(element);

        expect(element.shadowRoot.querySelector('.nestedElse')).not.toBeNull();

        element.showNestedContent = true;
        return Promise.resolve().then(() => {
            expect(element.shadowRoot.querySelector('.nestedContent')).not.toBeNull();
        });
    });

    it('should render list content properly', () => {
        const element = createElement('x-complex', { is: XComplex });
        element.showList = true;
        document.body.appendChild(element);

        expect(element.shadowRoot.querySelector('.if').textContent).toBe('123');
    });

    it('should rerender list content when updated', () => {
        const element = createElement('x-for-each', { is: XForEach });
        element.showList = true;
        document.body.appendChild(element);

        expect(element.shadowRoot.querySelector('.if').textContent).toBe('123');

        element.appendToList({
            value: 4,
            show: true,
        });

        return Promise.resolve()
            .then(() => {
                expect(element.shadowRoot.querySelector('.if').textContent).toBe('1234');

                element.showList = false;
                element.appendToList({
                    value: 5,
                    show: true,
                });
                element.prependToList({
                    value: 0,
                    show: true,
                });
            })
            .then(() => {
                expect(element.shadowRoot.querySelector('.if')).toBeNull();

                element.showList = true;
            })
            .then(() => {
                expect(element.shadowRoot.querySelector('.if').textContent).toBe('012345');
            });
    });

    it('should rerender list items when conditional expressions change', () => {
        const element = createElement('x-for-each', { is: XForEach });
        element.showList = true;
        document.body.appendChild(element);

        expect(element.shadowRoot.querySelector('.if').textContent).toBe('123');

        element.appendToList({
            value: 4,
            show: false,
        });

        return Promise.resolve()
            .then(() => {
                expect(element.shadowRoot.querySelector('.if').textContent).toBe('123');

                element.show(4);
            })
            .then(() => {
                expect(element.shadowRoot.querySelector('.if').textContent).toBe('1234');

                element.hide(1);
                element.hide(3);
                element.prependToList({
                    value: 0,
                    show: true,
                });
            })
            .then(() => {
                expect(element.shadowRoot.querySelector('.if').textContent).toBe('024');
            });
    });

    describe('slots', () => {
        it.skip('should render content from named slot', () => {
            const element = createElement('x-parent', { is: XparentWithNamedSlot });
            document.body.appendChild(element);

            const child = element.shadowRoot.querySelector('x-child-with-named-slots');

            // When if condition is false, no slot content is provided by parent
            const assignedNodes = child.shadowRoot.querySelector('slot').assignedNodes();
            expect(assignedNodes).toHaveSize(0);

            element.condition = true;
            return Promise.resolve().then(() => {
                const assignedNodes = child.shadowRoot.querySelector('slot').assignedNodes();
                expect(assignedNodes).toHaveSize(3); // VFragment has empty text nodes as delimiters
                expect(assignedNodes[1].innerHTML).toBe('Named slot content from parent');
            });
        });
    });
});
