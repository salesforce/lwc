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
         * Called when the element is inserted in a document
         */
        connectedCallback(): void;
        /**
         * Called when the element is removed from a document
         */
        disconnectedCallback(): void;
        /**
         * Called after every render of the component
         */
        renderedCallback(): void;
        /**
         * Called when a descendant component throws an error in one of its lifecycle hooks
         */
        errorCallback(error: any, stack: string): void;
        
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
     * Decorator factory to wire a property or method to a wire adapter data source
     * @param getType imperative accessor for the data source
     * @param config configuration object for the accessor
     */
    export function wire(getType: (config: any) => any, config: any): PropertyDecorator;
}
