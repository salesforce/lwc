// subtypes from the engine
export { Element, ComposableEvent } from 'engine';
export interface WireDef {
    params: {
        [key: string]: string;
    };
    static?: {
        [key: string]: any;
    };
    adapter: any;
    method?: 1;
}
export interface ElementDef {
    // wire is optional on ElementDef but the engine guarantees it before invoking wiring service hook
    wire: {
        [key: string]: WireDef
    };
}
