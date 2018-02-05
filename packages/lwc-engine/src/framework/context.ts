import { Template } from "./template";

const TopLevelContextSymbol = Symbol();

export interface Context {
    [TopLevelContextSymbol]?: boolean;
    tplToken?: string;
    tplCache?: Template | undefined;
    [key: string]: any;
}

export let currentContext: Context = {};

currentContext[TopLevelContextSymbol] = true;

export function establishContext(ctx: Context) {
    currentContext = ctx;
}
