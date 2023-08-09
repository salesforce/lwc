import { createElement } from 'lwc';
import LWCParent from 'x/lwcParent';
import NativeShadowParent from './x/NativeParent/NativeParent';
import NativeShadowChild from './x/NativeChild/NativeChild';

describe('Event target retains native behavior in native shadow dom tree', () => {
    let parent;
    let child;
    let eventTargetAtBody;
    let container;
    const listener = (evt) => {
        eventTargetAtBody = evt.target;
    };
    beforeEach(() => {
        parent = NativeShadowParent();
        document.body.appendChild(parent);
        child = NativeShadowChild();
        container = parent.shadowRoot.querySelector('div');
        container.appendChild(child);
        document.body.addEventListener('test', listener);
    });
    afterEach(() => {
        document.body.removeEventListener('test', listener);
        eventTargetAtBody = undefined;
    });

    describe('composed:false', () => {
        it('event dispatched at root custom element', () => {
            let targetAtSource;
            parent.addEventListener('test', (evt) => {
                targetAtSource = evt.target;
            });
            const event = new CustomEvent('test', { bubbles: true });
            parent.dispatchEvent(event);
            expect(targetAtSource).toBe(parent);
            expect(eventTargetAtBody).toBe(parent);
        });

        it('event dispatched inside root custom element', () => {
            let targetAtParent;
            parent.addEventListener('test', (evt) => {
                targetAtParent = evt.target;
            });

            let targetAtContainer;
            container.addEventListener('test', (evt) => {
                targetAtContainer = evt.target;
            });
            const event = new CustomEvent('test', { bubbles: true });
            const innerElm = parent.shadowRoot.querySelector('x-native-child');
            innerElm.dispatchEvent(event);

            // bubbling event in shadow tree
            expect(targetAtContainer).toBe(innerElm);

            // Non-composed event should stop at shadow boundary
            expect(targetAtParent).toBeUndefined();
            expect(eventTargetAtBody).toBeUndefined();
        });

        it('event dispatched inside nested custom element', () => {
            let targetAtParent;
            parent.addEventListener('test', (evt) => {
                targetAtParent = evt.target;
            });

            let targetAtContainer;
            container.addEventListener('test', (evt) => {
                targetAtContainer = evt.target;
            });
            const event = new CustomEvent('test', { bubbles: true });
            const nestedElm = child.shadowRoot.querySelector('h2');
            nestedElm.dispatchEvent(event);

            // Non-composed event should stop at shadow boundary
            expect(targetAtContainer).toBeUndefined();
            expect(targetAtParent).toBeUndefined();
            expect(eventTargetAtBody).toBeUndefined();
        });
    });

    describe('composed:true', () => {
        it('event dispatched at root custom element', () => {
            let targetAtSource;
            parent.addEventListener('test', (evt) => {
                targetAtSource = evt.target;
            });
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            parent.dispatchEvent(event);
            expect(targetAtSource).toBe(parent);
            expect(eventTargetAtBody).toBe(parent);
        });

        it('event dispatched inside root custom element', () => {
            let targetAtParent;
            parent.addEventListener('test', (evt) => {
                targetAtParent = evt.target;
            });

            let targetAtContainer;
            container.addEventListener('test', (evt) => {
                targetAtContainer = evt.target;
            });
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            const innerElm = parent.shadowRoot.querySelector('x-native-child');
            innerElm.dispatchEvent(event);

            // bubbling event in shadow tree
            expect(targetAtContainer).toBe(innerElm);

            // composed event should bubble up to document
            expect(targetAtParent).toBe(parent);
            expect(eventTargetAtBody).toBe(parent);
        });

        it('event dispatched inside nested custom element', () => {
            let targetAtParent;
            parent.addEventListener('test', (evt) => {
                targetAtParent = evt.target;
            });

            let targetAtContainer;
            container.addEventListener('test', (evt) => {
                targetAtContainer = evt.target;
            });
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            const nestedElm = child.shadowRoot.querySelector('h2');
            nestedElm.dispatchEvent(event);

            // composed event should bubble up to document
            expect(targetAtContainer).toBe(child);
            expect(targetAtParent).toBe(parent);
            expect(eventTargetAtBody).toBe(parent);
        });
    });
});

describe('Event target retains native behavior in mixed shadow dom tree(synthetic-shadow outside & native inside)', () => {
    let parent;
    let child;
    let eventTargetAtBody;
    let container;
    let lwcParent;
    const listener = (evt) => {
        eventTargetAtBody = evt.target;
    };
    beforeEach(() => {
        parent = NativeShadowParent();
        child = NativeShadowChild();
        container = parent.shadowRoot.querySelector('div');
        container.appendChild(child);
        document.body.addEventListener('test', listener);

        // LWC tree
        lwcParent = createElement('x-lwc-parent', { is: LWCParent });
        document.body.appendChild(lwcParent);
        const domManual = lwcParent.shadowRoot.querySelector('div');
        domManual.appendChild(parent);
        // Allow for portal elements to be adopted
        return Promise.resolve();
    });
    afterEach(() => {
        document.body.removeEventListener('test', listener);
        eventTargetAtBody = undefined;
    });

    describe('composed:false', () => {
        it('event dispatched at root custom element', () => {
            let targetAtSource;
            parent.addEventListener('test', (evt) => {
                targetAtSource = evt.target;
            });
            const event = new CustomEvent('test', { bubbles: true });
            parent.dispatchEvent(event);
            expect(targetAtSource).toBe(parent);

            // Non-composed event should stop at shadow boundary
            // TODO [#1700]: Listener should not be invoked
            expect(eventTargetAtBody).toBeFalsy();
        });

        it('event dispatched inside root custom element', () => {
            let targetAtParent;
            parent.addEventListener('test', (evt) => {
                targetAtParent = evt.target;
            });

            let targetAtContainer;
            container.addEventListener('test', (evt) => {
                targetAtContainer = evt.target;
            });
            const event = new CustomEvent('test', { bubbles: true });
            const innerElm = parent.shadowRoot.querySelector('x-native-child');
            innerElm.dispatchEvent(event);

            // bubbling event in shadow tree
            expect(targetAtContainer).toBe(innerElm);

            // Non-composed event should stop at shadow boundary
            expect(targetAtParent).toBeUndefined();
            expect(eventTargetAtBody).toBeUndefined();
        });

        it('event dispatched inside nested custom element', () => {
            let targetAtParent;
            parent.addEventListener('test', (evt) => {
                targetAtParent = evt.target;
            });

            let targetAtContainer;
            container.addEventListener('test', (evt) => {
                targetAtContainer = evt.target;
            });
            const event = new CustomEvent('test', { bubbles: true });
            const nestedElm = child.shadowRoot.querySelector('h2');
            nestedElm.dispatchEvent(event);

            // Non-composed event should stop at shadow boundary
            expect(targetAtContainer).toBeUndefined();
            expect(targetAtParent).toBeUndefined();
            expect(eventTargetAtBody).toBeUndefined();
        });
    });

    describe('composed:true', () => {
        it('event dispatched at root custom element', () => {
            let targetAtSource;
            parent.addEventListener('test', (evt) => {
                targetAtSource = evt.target;
            });
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            parent.dispatchEvent(event);
            expect(targetAtSource).toBe(parent);
            expect(eventTargetAtBody).toBe(lwcParent);
        });

        it('event dispatched inside root custom element', () => {
            let targetAtParent;
            parent.addEventListener('test', (evt) => {
                targetAtParent = evt.target;
            });

            let targetAtContainer;
            container.addEventListener('test', (evt) => {
                targetAtContainer = evt.target;
            });
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            const innerElm = parent.shadowRoot.querySelector('x-native-child');
            innerElm.dispatchEvent(event);

            // bubbling event in shadow tree
            expect(targetAtContainer).toBe(innerElm);

            // composed event should bubble up to document
            expect(targetAtParent).toBe(parent);
            expect(eventTargetAtBody).toBe(lwcParent);
        });

        it('event dispatched inside nested custom element', () => {
            let targetAtParent;
            parent.addEventListener('test', (evt) => {
                targetAtParent = evt.target;
            });

            let targetAtContainer;
            container.addEventListener('test', (evt) => {
                targetAtContainer = evt.target;
            });
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            const nestedElm = child.shadowRoot.querySelector('h2');
            nestedElm.dispatchEvent(event);

            // composed event should bubble up to document
            expect(targetAtContainer).toBe(child);
            expect(targetAtParent).toBe(parent);
            expect(eventTargetAtBody).toBe(lwcParent);
        });
    });
});
