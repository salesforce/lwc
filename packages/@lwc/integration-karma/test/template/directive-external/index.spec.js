import { createElement } from 'lwc';
import XWithoutChildren from 'x/withoutChildren';
import XWithChildren from 'x/withChildren';
import XWithDifferentViews from 'x/withDifferentViews';
import XWithImperativeEvent from 'x/withImperativeEvent';
import XWithDeclarativeEvent from 'x/withDeclarativeEvent';
import XWithUnregisteredWC from 'x/withUnregisteredWC';

import './custom-elements/ce-without-children';
import './custom-elements/ce-with-children';
import './custom-elements/ce-with-event';

if (!process.env.COMPAT) {
    describe('lwc:external directive basic tests', () => {
        it('should render a Custom Element without children', () => {
            const elm = createElement('x-without-children', { is: XWithoutChildren });
            document.body.appendChild(elm);

            expect(elm.shadowRoot.querySelector('ce-without-children')).not.toBeNull();
        });

        it('should render a Custom Element with children', () => {
            const elm = createElement('x-with-children', { is: XWithChildren });
            document.body.appendChild(elm);

            const ce = elm.shadowRoot.querySelector('ce-with-children');
            const heading = ce.shadowRoot.querySelector('h1');
            expect(heading).not.toBeNull();
            expect(heading.textContent).toBe('Test h1');
            const paragraph = ce.shadowRoot.querySelector('p');
            expect(paragraph).not.toBeNull();
            expect(paragraph.textContent).toBe('Test p');

            const slotContent = ce.shadowRoot.querySelector('slot').assignedNodes();
            expect(slotContent.length).toBe(1);
            expect(slotContent[0].textContent).toBe('slot content');
        });

        it('should render a Custom Element and handle hiding and showing the element', () => {
            const elm = createElement('x-with-different-views', { is: XWithDifferentViews });
            document.body.appendChild(elm);

            let ce = elm.shadowRoot.querySelector('ce-with-children');
            expect(ce).toBeNull();

            elm.showWC = true;
            return Promise.resolve().then(() => {
                ce = elm.shadowRoot.querySelector('ce-with-children');
                expect(ce).not.toBeNull();
            });
        });

        it('should imperatively listen to a DOM event dispatched by a Custom Element', () => {
            const elm = createElement('x-with-imperative-event', { is: XWithImperativeEvent });
            document.body.appendChild(elm);

            const handled = elm.shadowRoot.querySelector('div');
            expect(handled.textContent).toBe('false');

            const ce = elm.shadowRoot.querySelector('ce-with-event');
            ce.click();
            return Promise.resolve().then(() => {
                expect(handled.textContent).toBe('true');
            });
        });

        it('should declaratively listen to a DOM event dispatched by a Custom Element', () => {
            const elm = createElement('x-with-declarative-event', { is: XWithDeclarativeEvent });
            document.body.appendChild(elm);

            const handled = elm.shadowRoot.querySelector('div');
            expect(handled.textContent).toBe('false');

            const ce = elm.shadowRoot.querySelector('ce-with-event');
            ce.click();
            return Promise.resolve().then(() => {
                expect(handled.textContent).toBe('true');
            });
        });

        it('should use unresolved HTMLElement if Custom Element is not registered', () => {
            const elm = createElement('x-with-unregsitered-wc', { is: XWithUnregisteredWC });
            document.body.appendChild(elm);

            const ce = elm.shadowRoot.querySelector('ce-not-registered');
            expect(ce).not.toBeNull();
            expect(ce instanceof HTMLElement).toBe(true);
            expect(customElements.get('ce-not-registered')).toBe(undefined);
        });
    });
}
