import { Template } from "./template";

const TopLevelContextSymbol = Symbol();

export interface Context {
    [TopLevelContextSymbol]?: boolean;
    hostToken?: string;
    shadowToken?: string;
    tplCache?: Template;
    [key: string]: any;
}

export let currentContext: Context = {};

currentContext[TopLevelContextSymbol] = true;

export function establishContext(ctx: Context) {
    currentContext = ctx;
}
