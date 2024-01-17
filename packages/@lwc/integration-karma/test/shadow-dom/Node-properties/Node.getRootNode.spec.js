import { createElement } from 'lwc';
import { nativeCustomElementLifecycleEnabled } from 'test-utils';
import Slotted from 'x/slotted';
import Container from 'x/container';
import ManualNodes from 'x/manualNodes';
import WithLwcDomManualNested from 'x/withLwcDomManualNested';
import WithLwcDomManual from 'x/withLwcDomManual';
import WithoutLwcDomManual from 'x/withoutLwcDomManual';
import Text from 'x/text';

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
        const doAppend = () => frag.appendChild(elm);

        if (nativeCustomElementLifecycleEnabled) {
            doAppend();
        } else {
            // Expected warning, since we are working with disconnected nodes
            expect(doAppend).toLogWarningDev([
                /fired a `connectedCallback` and rendered, but was not connected to the DOM/,
                /fired a `connectedCallback` and rendered, but was not connected to the DOM/,
            ]);
        }

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

    describe('manual dom mutations', () => {
        it('nodes appended to parent with lwc:dom="manual" directive', () => {
            const host = createElement('x-manual-nodes', { is: ManualNodes });
            document.body.appendChild(host);
            const elm = host.shadowRoot.querySelector('div.manual');
            const span = document.createElement('span');
            span.innerHTML = '<ul> <li>Dog</li> </ul>';

            elm.appendChild(span);
            const nestedManualElement = host.shadowRoot.querySelector('li');
            function verifyConnectedNodes() {
                expect(span.getRootNode()).toBe(host.shadowRoot);
                expect(span.getRootNode(composedTrueConfig)).toBe(document);

                expect(nestedManualElement.getRootNode()).toBe(host.shadowRoot);
                expect(nestedManualElement.getRootNode(composedTrueConfig)).toBe(document);
            }
            // Verify immediately after appending the child elements
            // the portal elements would not have been patched yet
            verifyConnectedNodes();
            // allow for engine's mutation observer to pick up the mutations
            return Promise.resolve()
                .then(() => {
                    // reverify, after the portal elements have been patched
                    verifyConnectedNodes();
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

        it('node appended to parent without lwc:dom="manual" directive', () => {
            const host = createElement('x-manual-nodes', { is: ManualNodes });
            document.body.appendChild(host);
            const elm = host.shadowRoot.querySelector('div.withoutManual');
            const span = document.createElement('span');

            spyOn(console, 'warn'); // Ignore the engine warning
            elm.appendChild(span);
            expect(span.getRootNode()).toBe(host.shadowRoot);
            expect(span.getRootNode(composedTrueConfig)).toBe(document);

            elm.removeChild(span);
            expect(span.getRootNode()).toBe(span);
            expect(span.getRootNode(composedTrueConfig)).toBe(span);
        });

        it('dynamic lwc element appended to parent without lwc:dom="manual" directive', () => {
            const host = createElement('x-manual-nodes', { is: ManualNodes });
            document.body.appendChild(host);
            const elm = host.shadowRoot.querySelector('div.withoutManual');
            const nestedElem = createElement('x-text', { is: Text });

            spyOn(console, 'warn'); // Ignore the engine warning
            elm.appendChild(nestedElem);
            expect(nestedElem.getRootNode()).toBe(host.shadowRoot);
            expect(nestedElem.getRootNode(composedTrueConfig)).toBe(document);

            expect(nestedElem.shadowRoot.getRootNode()).toBe(nestedElem.shadowRoot);
            expect(nestedElem.shadowRoot.getRootNode(composedTrueConfig)).toBe(document);

            const innerTxt = nestedElem.shadowRoot.childNodes[0];
            expect(innerTxt.getRootNode()).toBe(nestedElem.shadowRoot);
            expect(innerTxt.getRootNode(composedTrueConfig)).toBe(document);
        });

        // #1022 Support insertion of lwc element inside a node marked as lwc:dom="manual"
        describe('nested dynamic lwc elm with dom manual', () => {
            let outerElem;
            let innerElem;
            beforeEach(() => {
                outerElem = createElement('x-outer', { is: WithLwcDomManual });
                document.body.appendChild(outerElem);
                innerElem = createElement('x-inner', { is: WithLwcDomManualNested });
                const div = outerElem.shadowRoot.querySelector('div');
                div.appendChild(innerElem);
            });

            it('getRootNode() of inner custom element should return outer shadowRoot', () => {
                expect(innerElem.getRootNode()).toBe(outerElem.shadowRoot);
                expect(innerElem.getRootNode(composedTrueConfig)).toBe(document);
            });

            it("getRootNode() of inner shadow's template element should return inner shadowRoot", () => {
                const innerDiv = innerElem.shadowRoot.querySelector('div');
                expect(innerDiv.getRootNode()).toBe(innerElem.shadowRoot);
                expect(innerDiv.getRootNode(composedTrueConfig)).toBe(document);
            });

            // Real issue is with MutationObserver
            it("getRootNode() of inner shadow's dynamic element should return inner shadowRoot", () => {
                const innerDiv = innerElem.shadowRoot.querySelector('div');
                innerDiv.innerHTML = '<p class="innerP"></p>';

                const p = innerElem.shadowRoot.querySelector('.innerP');
                expect(p.getRootNode()).toBe(innerElem.shadowRoot);
                expect(p.getRootNode(composedTrueConfig)).toBe(document);
            });
        });

        // #1022 Support insertion of lwc element inside a node marked as lwc:dom="manual"
        // This usecase is important and distinct from the previous testcase. The nested lwc element's portal will not be patched
        describe('nested dynamic lwc elm without dom manual', () => {
            let outerElem;
            let innerElem;
            beforeEach(() => {
                outerElem = createElement('x-outer', { is: WithLwcDomManual });
                document.body.appendChild(outerElem);
                innerElem = createElement('x-inner', { is: WithoutLwcDomManual });
                const div = outerElem.shadowRoot.querySelector('div');
                div.appendChild(innerElem);
                // Ignore the engine warning that a node without lwc:dom="manual" is being manually changed
                spyOn(console, 'warn');
            });

            it("getRootNode() of inner shadow's dynamic element should return inner shadowRoot", () => {
                const innerDiv = innerElem.shadowRoot.querySelector('div');
                innerDiv.innerHTML = '<p class="innerP"></p>';
                const p = innerElem.shadowRoot.querySelector('.innerP');
                expect(p.getRootNode()).toBe(innerElem.shadowRoot);
                expect(p.getRootNode(composedTrueConfig)).toBe(document);
            });
        });
    });

    // Derived from https://github.com/web-platform-tests/wpt/blob/7c50c216081d6ea3c9afe553ee7b64534020a1b2/dom/nodes/rootNode.html
    // Filed an issue to integrate wpt suite https://github.com/salesforce/lwc/issues/1078
    describe('conformance test for vanilla html', () => {
        let elem;
        let txt;
        let comment;
        let processingInstruction;
        beforeEach(() => {
            elem = document.createElement('div');
            txt = document.createTextNode('');
            comment = document.createComment('');
            const doc = new DOMParser().parseFromString('<foo />', 'application/xml');
            processingInstruction = doc.createProcessingInstruction(
                'xml-stylesheet',
                'href="mycss.css" type="text/css"'
            );
        });
        it('getRootNode() on disconnected node should return same node', () => {
            expect(elem.getRootNode()).toBe(elem);
            expect(elem.getRootNode(composedTrueConfig)).toBe(elem);

            expect(txt.getRootNode()).toBe(txt);
            expect(txt.getRootNode(composedTrueConfig)).toBe(txt);

            expect(comment.getRootNode()).toBe(comment);
            expect(comment.getRootNode(composedTrueConfig)).toBe(comment);

            expect(processingInstruction.getRootNode()).toBe(processingInstruction);
            expect(processingInstruction.getRootNode(composedTrueConfig)).toBe(
                processingInstruction
            );

            expect(document.getRootNode()).toBe(document);
        });

        it('getRootNode() on node whose parent is a disconnected node', () => {
            const parent = document.createElement('div');

            parent.appendChild(elem);
            expect(elem.getRootNode()).toBe(parent);
            expect(elem.getRootNode(composedTrueConfig)).toBe(parent);

            parent.appendChild(txt);
            expect(txt.getRootNode()).toBe(parent);
            expect(txt.getRootNode(composedTrueConfig)).toBe(parent);

            parent.appendChild(comment);
            expect(comment.getRootNode()).toBe(parent);
            expect(comment.getRootNode(composedTrueConfig)).toBe(parent);

            parent.appendChild(processingInstruction);
            expect(processingInstruction.getRootNode()).toBe(parent);
            expect(processingInstruction.getRootNode(composedTrueConfig)).toBe(parent);
        });

        it('getRootNode() on node whose parent is a connected node', () => {
            const parent = document.createElement('div');
            document.body.appendChild(parent);

            parent.appendChild(elem);
            expect(elem.getRootNode()).toBe(document);
            expect(elem.getRootNode(composedTrueConfig)).toBe(document);

            parent.appendChild(txt);
            expect(txt.getRootNode()).toBe(document);
            expect(txt.getRootNode(composedTrueConfig)).toBe(document);

            parent.appendChild(comment);
            expect(comment.getRootNode()).toBe(document);
            expect(comment.getRootNode(composedTrueConfig)).toBe(document);

            parent.appendChild(processingInstruction);
            expect(processingInstruction.getRootNode()).toBe(document);
            expect(processingInstruction.getRootNode(composedTrueConfig)).toBe(document);
        });

        it('getRootNode() on node whose parent is a disconnected node', () => {
            const fragment = document.createDocumentFragment();

            fragment.appendChild(elem);
            expect(elem.getRootNode()).toBe(fragment);
            expect(elem.getRootNode(composedTrueConfig)).toBe(fragment);

            fragment.appendChild(txt);
            expect(txt.getRootNode()).toBe(fragment);
            expect(txt.getRootNode(composedTrueConfig)).toBe(fragment);

            fragment.appendChild(comment);
            expect(comment.getRootNode()).toBe(fragment);
            expect(comment.getRootNode(composedTrueConfig)).toBe(fragment);

            fragment.appendChild(processingInstruction);
            expect(processingInstruction.getRootNode()).toBe(fragment);
            expect(processingInstruction.getRootNode(composedTrueConfig)).toBe(fragment);
        });

        if (process.env.NATIVE_SHADOW) {
            it('native shadow dom', () => {
                const shadowHost = document.createElement('div');
                document.body.appendChild(shadowHost);
                const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
                shadowRoot.innerHTML = '<div class="shadowChild">content</div>';
                const shadowChild = shadowRoot.querySelector('.shadowChild');

                expect(shadowChild.getRootNode(composedTrueConfig)).toBe(document);
                expect(shadowChild.getRootNode({ composed: false })).toBe(shadowRoot);
                expect(shadowChild.getRootNode()).toBe(shadowRoot);
            });
            it('lwc element inside native shadow', () => {
                const shadowHost = document.createElement('div');
                document.body.appendChild(shadowHost);
                const nativeShadowRoot = shadowHost.attachShadow({ mode: 'open' });
                const lwcElem = createElement('x-text', { is: Text });
                nativeShadowRoot.appendChild(lwcElem);
                const shadowChild = nativeShadowRoot.querySelector('x-text');

                expect(shadowChild.getRootNode(composedTrueConfig)).toBe(document);
                expect(shadowChild.getRootNode()).toBe(nativeShadowRoot);

                const syntheticShadowRoot = lwcElem.shadowRoot;
                expect(syntheticShadowRoot.getRootNode(composedTrueConfig)).toBe(document);
                expect(syntheticShadowRoot.getRootNode()).toBe(syntheticShadowRoot);

                const lwcTemplateNode = syntheticShadowRoot.childNodes[0];
                expect(lwcTemplateNode.getRootNode(composedTrueConfig)).toBe(document);
                expect(lwcTemplateNode.getRootNode()).toBe(syntheticShadowRoot);
            });
        }
    });
});
