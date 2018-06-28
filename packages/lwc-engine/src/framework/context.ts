import { Template } from "./template";

export interface Context {
    hostToken?: string;
    shadowToken?: string;
    tplCache?: Template;
    [key: string]: any;
}

export let currentContext: Context = {};

export function establishContext(ctx: Context) {
    currentContext = ctx;
}
