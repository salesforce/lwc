import { createElement } from 'test-utils';
import Slotted from 'x/slotted';
import Container from 'x/container';
import ManualNodes from 'x/manualNodes';


const composedTrueConfig = { composed: true };
describe('Node.getRootNode', () => {
    it('root element', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.getRootNode()).toBe(document);
        expect(elm.getRootNode(composedTrueConfig)).toBe(document);
    });

    it('shadowRoot', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);
        const shadowRoot = elm.shadowRoot;

        expect(shadowRoot.getRootNode()).toBe(shadowRoot);
        expect(shadowRoot.getRootNode(composedTrueConfig)).toBe(document);
    });

    it('disconnected root element', () => {
        const elm = createElement('x-slotted', { is: Slotted });

        expect(elm.getRootNode()).toBe(elm);
        expect(elm.getRootNode(composedTrueConfig)).toBe(elm);
    });

    it('root element in a disconnected DOM tree', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        const frag = document.createDocumentFragment();
        frag.appendChild(elm);

        expect(elm.getRootNode()).toBe(frag);
        expect(elm.getRootNode(composedTrueConfig)).toBe(frag);
    });

    it('shadowRoot', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const target = elm.shadowRoot;
        expect(target.getRootNode()).toBe(target);
        expect(target.getRootNode(composedTrueConfig)).toBe(document);
    });

    it('element in the shadow', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const target = elm.shadowRoot.querySelector('x-container');
        expect(target.getRootNode()).toBe(elm.shadowRoot);
        expect(target.getRootNode(composedTrueConfig)).toBe(document);
    });

    it('slotted element', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const target = elm.shadowRoot.querySelector('.slotted');
        expect(target.getRootNode()).toBe(elm.shadowRoot);
        expect(target.getRootNode(composedTrueConfig)).toBe(document);
    });

    it('element in a nested shadow', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('x-container');
        const target = container.shadowRoot.querySelector('.container');
        expect(target.getRootNode()).toBe(container.shadowRoot);
        expect(target.getRootNode(composedTrueConfig)).toBe(document);
    });

    it('default slot content', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        const target = elm.shadowRoot.querySelector('.default-slotted');
        expect(target.getRootNode()).toBe(elm.shadowRoot);
        expect(target.getRootNode(composedTrueConfig)).toBe(document);
    });

    xdescribe('manually inserted dom elements', () => {
        it('nodes appended to parent with lwc:dom="manual" directive', () => {
            const host = createElement('x-manual-nodes', { is: ManualNodes });
            document.body.appendChild(host);
            const elm = host.shadowRoot.querySelector('div.manual');
            const span = document.createElement('span');
            span.innerHTML = '<ul> <li>Dog</li> </ul>';

            elm.appendChild(span);
            const nestedManualElement = host.shadowRoot.querySelector('li');
            // allow for engine's mutation observer to pick up the mutations and patch the portal elements
            return Promise.resolve()
                .then(() => {
                    expect(span.getRootNode()).toBe(host.shadowRoot);
                    expect(span.getRootNode(composedTrueConfig)).toBe(document);

                    expect(nestedManualElement.getRootNode()).toBe(host.shadowRoot);
                    expect(nestedManualElement.getRootNode(composedTrueConfig)).toBe(host.shadowRoot);
                    // disconnect the manually inserted nodes
                    elm.removeChild(span);
                })
                .then(() => {
                    expect(span.getRootNode()).toBe(span);
                    expect(span.getRootNode(composedTrueConfig)).toBe(span);

                    expect(nestedManualElement.getRootNode()).toBe(span);
                    expect(nestedManualElement.getRootNode(composedTrueConfig)).toBe(span);
                });
        });

        it('nodes appended to parent without lwc:dom="manual" directive', () => {
            const host = createElement('x-manual-nodes', { is: ManualNodes });
            document.body.appendChild(host);
            const elm = host.shadowRoot.querySelector('div.withoutManual');
            const span = document.createElement('span');

            spyOn(console, 'error'); // Ignore the engine warning
            elm.appendChild(span);
            expect(span.getRootNode()).toBe(host.shadowRoot);
            expect(span.getRootNode(composedTrueConfig)).toBe(document);

            elm.removeChild(span);
            expect(span.getRootNode()).toBe(span);
            expect(span.getRootNode(composedTrueConfig)).toBe(span);
        });
    });

    describe('conformance test for vanilla html', () => {
        // Derived from https://github.com/web-platform-tests/wpt/blob/7c50c216081d6ea3c9afe553ee7b64534020a1b2/dom/nodes/rootNode.html
        it('getRootNode() on disconnected node should return same node', () => {
            const elem = document.createElement('div');
            expect(elem.getRootNode()).toBe(elem);
            expect(elem.getRootNode(composedTrueConfig)).toBe(elem);

            const txt = document.createTextNode('');
            expect(txt.getRootNode()).toBe(txt);
            expect(txt.getRootNode(composedTrueConfig)).toBe(txt);

            const comment = document.createComment('');
            expect(comment.getRootNode()).toBe(comment);
            expect(comment.getRootNode(composedTrueConfig)).toBe(comment);

            const processingInstruction = document.createProcessingInstruction('target', 'data');
            expect(processingInstruction.getRootNode()).toBe(processingInstruction);
            expect(processingInstruction.getRootNode(composedTrueConfig)).toBe(processingInstruction);

            expect(document.getRootNode()).toBe(document);
        });

        it('getRootNode() on node whose parent is a disconnected node', () => {
            const parent = document.createElement('div');

            const elem = document.createElement('div');
            parent.appendChild(elem);
            expect(elem.getRootNode()).toBe(parent);
            expect(elem.getRootNode(composedTrueConfig)).toBe(parent);

            const txt = document.createTextNode('');
            parent.appendChild(txt);
            expect(txt.getRootNode()).toBe(parent);
            expect(txt.getRootNode(composedTrueConfig)).toBe(parent);

            const comment = document.createComment('');
            parent.appendChild(comment);
            expect(comment.getRootNode()).toBe(parent);
            expect(comment.getRootNode(composedTrueConfig)).toBe(parent);

            const processingInstruction = document.createProcessingInstruction('target', 'data');
            parent.appendChild(processingInstruction);
            expect(processingInstruction.getRootNode()).toBe(parent);
            expect(processingInstruction.getRootNode(composedTrueConfig)).toBe(parent);
        });

        it('getRootNode() on node whose parent is a connected node', () => {
            const parent = document.createElement('div');
            document.body.appendChild(parent);

            const elem = document.createElement('div');
            parent.appendChild(elem);
            expect(elem.getRootNode()).toBe(document);
            expect(elem.getRootNode(composedTrueConfig)).toBe(document);

            const txt = document.createTextNode('');
            parent.appendChild(txt);
            expect(txt.getRootNode()).toBe(document);
            expect(txt.getRootNode(composedTrueConfig)).toBe(document);

            const comment = document.createComment('');
            parent.appendChild(comment);
            expect(comment.getRootNode()).toBe(document);
            expect(comment.getRootNode(composedTrueConfig)).toBe(document);

            const processingInstruction = document.createProcessingInstruction('target', 'data');
            parent.appendChild(processingInstruction);
            expect(processingInstruction.getRootNode()).toBe(document);
            expect(processingInstruction.getRootNode(composedTrueConfig)).toBe(document);
        });

        it('getRootNode() on node whose parent is a disconnected node', () => {
            const fragment = document.createDocumentFragment();

            const elem = document.createElement('div');
            fragment.appendChild(elem);
            expect(elem.getRootNode()).toBe(fragment);
            expect(elem.getRootNode(composedTrueConfig)).toBe(fragment);

            const txt = document.createTextNode('');
            fragment.appendChild(txt);
            expect(txt.getRootNode()).toBe(fragment);
            expect(txt.getRootNode(composedTrueConfig)).toBe(fragment);

            const comment = document.createComment('');
            fragment.appendChild(comment);
            expect(comment.getRootNode()).toBe(fragment);
            expect(comment.getRootNode(composedTrueConfig)).toBe(fragment);

            const processingInstruction = document.createProcessingInstruction('target', 'data');
            fragment.appendChild(processingInstruction);
            expect(processingInstruction.getRootNode()).toBe(fragment);
            expect(processingInstruction.getRootNode(composedTrueConfig)).toBe(fragment);
        });

        if (process.env.NATIVE_SHADOW) {
            it('', () => {
                const shadowHost = document.createElement('div');
                document.body.appendChild(shadowHost);
                const shadowRoot = shadowHost.attachShadow({mode: 'open'});
                shadowRoot.innerHTML = '<div class="shadowChild">content</div>';
                const shadowChild = shadowRoot.querySelector('.shadowChild');

                expect(shadowChild.getRootNode(composedTrueConfig)).toBe(document);
                expect(shadowChild.getRootNode({ composed: false })).toBe(shadowRoot);
                expect(shadowChild.getRootNode()).toBe(shadowRoot);
            });
        }
    });
});
