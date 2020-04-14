import { createElement } from 'lwc';
import XAsyncEventTarget from 'x/asyncEventTarget';
import XEventHandlingParent from 'x/eventHandlingParent';
import XDocumentEventListener from 'x/documentEventListener';
import XParentWithDynamicChild from 'x/parentWithDynamicChild';

it('Async event target should be root node', function () {
    const elm = createElement('x-async-event-target', { is: XAsyncEventTarget });
    document.body.appendChild(elm);
    const triggerElm = elm.shadowRoot.querySelector('x-child');
    triggerElm.click();
    expect(elm.syncTargetIsCorrect).toBe(true);
    return new Promise(setTimeout).then(() => {
        expect(elm.asyncTargetIsCorrect).toBe(true);
    });
});

it('parent should receive composed event with correct target', function () {
    const elm = createElement('x-parent', { is: XEventHandlingParent });
    document.body.appendChild(elm);
    const child = elm.shadowRoot.querySelector('x-event-dispatching-child');
    child.dispatchFoo();
    expect(elm.evtTargetIsXChild).toBe(true);
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('.evt-target-is-x-child')).not.toBe(null);
    });
});

describe('event.target on document event listener', () => {
    let actual;
    const listener = (evt) => {
        actual = evt.target.tagName.toLowerCase();
    };
    beforeAll(() => {
        document.addEventListener('click', listener);
    });
    afterAll(() => {
        document.removeEventListener('click', listener);
    });
    it('should return correct target', function () {
        const elm = createElement('x-document-event-listener', { is: XDocumentEventListener });
        document.body.appendChild(elm);
        elm.shadowRoot.querySelector('button').click();
        expect(actual).toBe('x-document-event-listener');
    });
});

// legacy usecases
describe('should not retarget event', () => {
    if (!process.env.NATIVE_SHADOW) {
        let elm;
        let child;
        let originalTarget;

        beforeAll(() => {
            spyOn(console, 'error');
            elm = createElement('x-parent-with-dynamic-child', {
                is: XParentWithDynamicChild,
            });
            document.body.appendChild(elm);
            child = elm.shadowRoot.querySelector('x-child-with-out-lwc-dom-manual');
            originalTarget = child.shadowRoot.querySelector('span');
        });
        it('when original target node is not keyed and event is accessed async (W-6586380)', (done) => {
            elm.eventListener = (evt) => {
                expect(evt.currentTarget).toBe(elm.shadowRoot.querySelector('div'));
                expect(evt.target).toBe(child);
                setTimeout(() => {
                    // Expect event target to be not retargeted
                    expect(evt.currentTarget).toBeNull();
                    expect(evt.target).toBe(originalTarget);
                    done();
                });
            };
            originalTarget.click();
        });

        describe('received at a global listener', () => {
            let actualCurrentTarget;
            let actualTarget;
            const globalListener = (evt) => {
                actualCurrentTarget = evt.currentTarget;
                actualTarget = evt.target;
            };
            afterAll(() => {
                document.removeEventListener(globalListener);
            });

            it('when original target node is not keyed and currentTarget is document (W-6626752)', () => {
                document.addEventListener('click', globalListener);
                originalTarget.click();
                expect(actualCurrentTarget).toBe(document);
                expect(actualTarget).toBe(originalTarget);
            });
        });
    }
});
