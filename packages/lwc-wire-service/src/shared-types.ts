export interface WireDef {
    params: {
        [key: string]: string;
    };
    static: {
        [key: string]: any;
    };
    type?: string;
    adapter?: any;
    method?: 1;
}
export interface ElementDef {
    wire: { // TODO - wire is optional but all wire service code assumes it's present
        [key: string] : WireDef
    };
}
