import { createElement, Element } from '../../main';
import { getHostShadowRoot } from "../../html-element";

describe('DOM inspection', () => {

    function tmpl$1($api, $cmp, $slotset, $ctx) {
        const {
            t: api_text,
            h: api_element,
            s: api_slot
        } = $api;
        return [api_element("div", {
                key: 1,
                classMap: {
                    portal: true
                }
            },
            [
                api_text("Before["),
                api_slot('', {
                    key: 2,
                    attrs: {
                        name: ''
                    }
                }, [], $slotset),
                api_text("]After")
            ]
        )];
    }
    tmpl$1.slots = [""];

    class Parent extends Element {
        render() {
            return tmpl$1;
        }
    }

    function tmpl$2($api, $cmp, $slotset, $ctx) {
        const {
            t: api_text,
            h: api_element,
            c: api_custom_element
        } = $api;

        return [
            api_custom_element("x-parent", Parent, {
                key: 1,
            }, [
                api_element("div", {
                        key: 2,
                        classMap: {
                            first: true
                        }
                    },
                    [api_text("Passed Text")]
                ),
            ])];
    }

    class Container extends Element {
        render() {
            return tmpl$2;
        }

    }

    const element = createElement('x-container', { is: Container });
    document.body.appendChild(element);

    describe('#innerHTML', () => {
        it('should implement elm.innerHTML shadow dom semantics', () => {
            const p = getHostShadowRoot(element).querySelector('x-parent');
            expect(p.innerHTML).toBe('<DIV class=\"first\">Passed Text</DIV>');
            expect(getHostShadowRoot(p).querySelector('div').innerHTML).toBe('Before[<SLOT name=\"\"></SLOT>]After');
        });
    });

    describe('#outerHTML', () => {
        it('should implement elm.outerHTML shadow dom semantics', () => {
            const p = getHostShadowRoot(element).querySelector('x-parent');
            expect(p.outerHTML).toBe('<X-PARENT><DIV class=\"first\">Passed Text</DIV></X-PARENT>');
            expect(getHostShadowRoot(p).querySelector('div').outerHTML).toBe('<DIV class=\"portal\">Before[<SLOT name=\"\"></SLOT>]After</DIV>');
        });
    });

    describe('#textContent', () => {
        it('should implement elm.textContent shadow dom semantics', () => {
            const p = getHostShadowRoot(element).querySelector('x-parent');
            expect(p.textContent).toBe('Passed Text');
            expect(getHostShadowRoot(p).querySelector('div').textContent).toBe('Before[]After');
        });
    });
});
