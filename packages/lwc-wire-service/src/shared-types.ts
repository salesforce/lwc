export interface WireDef {
    params?: {
        [key: string]: string;
    };
    static?: {
        [key: string]: any;
    };
    type?: string;
    adapter?: any;
    method?: 1;
}
export interface ElementDef {
    wire: { // TODO - wire is optional but all wire service code assumes it's present
        [key: string]: WireDef
    };
}

export type NoArgumentCallback = () => void;

export type UpdatedCallback = (object) => void;

export interface UpdatedCallbackConfig {
    updatedCallback: UpdatedCallback;
    statics?: {
        [key: string]: any;
    };
    params?: {
        [key: string]: string;
    };
}

export interface ServiceUpdateContext {
    callbacks: UpdatedCallbackConfig[];
    // union of callbacks.params values
    paramValues: Set<string>;
}

export type ServiceContext = NoArgumentCallback[] | ServiceUpdateContext;
