import { Template } from "./template";

export interface Context {
    hostAttribute?: string;
    shadowAttribute?: string;
    tplCache?: Template;
    [key: string]: any;
}

export let currentContext: Context = {};

export function establishContext(ctx: Context) {
    currentContext = ctx;
}
