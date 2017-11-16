/**
 * Lightning Web Components core module
 */
declare module 'engine' {

    interface ComposableEvent extends Event {
        composed: boolean
    }

    class HTMLElementTheGoodPart {
        dispatchEvent(evt: ComposableEvent): boolean;
        addEventListener(type: string, listener?: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;    
        removeEventListener(type: string, listener?: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
        getAttribute(name: string): string | null;
        getBoundingClientRect(): ClientRect;
        querySelector(selectors: string): HTMLElement | null
        querySelectorAll(selectors: string): NodeListOf<HTMLElement>
        readonly tagName: string
        tabIndex: number
        readonly classList: DOMTokenList;
    }
    
    interface ShadowRootTheGoodPart extends NodeSelector {
        mode: string;
        readonly host: Element;
    } 

    /**
     * Base class for the Lightning Web Component JavaScript class
     */
    export class Element extends HTMLElementTheGoodPart {
        /**
         * Called when the component is created
         */
        constructor();
        /**
         * Called when the component is inserted in a document
         */
        connectedCallback(): void;
        /**
         * Called when the component is removed from a document
         */
        disconnectedCallback(): void;
        /**
         * Called after every render of the component
         */
        renderedCallback(): void;
        /**
         * Called when an attribute is changed, appened, removed or replaced on the element
         */
        attributeChangedCallback(attributeName: string, oldValue: any, newValue: any): void;
        /**
         * Specifies the observed attributes
         */
        static observedAttributes: string[];
        
        readonly root: ShadowRootTheGoodPart;
    }

    /**
     * Decorator to mark public reactive properties
     */
    export const api: PropertyDecorator;

    /**
     * Decorator to mark private reactive properties
     */
    export const track: PropertyDecorator;

    /**
     * Decorator to wire a property or method to a wire adapter data source
     * @param adapterId globally unique identifier of the wire adapter
     * @param adapterConfig configuration object specific to the wire adapter
     */
    export function wire(adapterId: string, adapterConfig: Object): void;
}
