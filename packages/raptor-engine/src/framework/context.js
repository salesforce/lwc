const topLevelContextSymbol = Symbol('Top Level Context');

export let currentContext = {
    [topLevelContextSymbol]: true,
};

export function establishContext(ctx: Object) {
    currentContext = ctx;
}
