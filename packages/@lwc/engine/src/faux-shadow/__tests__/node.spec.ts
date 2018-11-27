import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from "../../framework/main";

describe('synthetic shadow -> node', () => {
    describe('getRootNode()', () => {
        // Initialized before each test
        let element;

        const childHtml = compileTemplate(`
            <template>
                <slot>
                </slot>
            </template>
        `);

        class AssignedNodesChild extends LightningElement {
            render() {
                return childHtml;
            }
        }

        const parentHtml = compileTemplate(`
            <template>
                <x-assigned-nodes-child>
                    <p></p>
                </x-assigned-nodes-child>
            </template>
        `, {
            modules: { 'x-assigned-nodes-child': AssignedNodesChild }
        });

        class AssignedNodesParent extends LightningElement {
            render() {
                return parentHtml;
            }
        }

        beforeEach(() => {
            element = createElement('x-assigned-nodes', { is: AssignedNodesParent });
        });

        it('should resolve to document for root elements', () => {
            document.body.appendChild(element);
            expect(element.getRootNode()).toBe(document);
        });

        it('should resolve to self for disconnected nodes', () => {
            document.body.appendChild(element);
            document.body.removeChild(element);
            expect(element.getRootNode()).toBe(element);
        });

        it('should resolve to shadowRoot', () => {
            document.body.appendChild(element);
            const child = element.shadowRoot.querySelector('x-assigned-nodes-child');
            expect(child.getRootNode()).toBe(element.shadowRoot);
        });

        it('should resolve document when composed is true', () => {
            document.body.appendChild(element);
            const child = element.shadowRoot.querySelector('x-assigned-nodes-child');
            expect(child.getRootNode({ composed: true })).toBe(document);
        });

        it('should resolve shadowRoot from shadowRoot', () => {
            document.body.appendChild(element);
            expect(element.shadowRoot.getRootNode()).toBe(element.shadowRoot);
        });
    });
});
