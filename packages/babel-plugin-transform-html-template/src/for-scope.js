// -- For loop utils
export function addScopeForLoop(path, forExpression) {
    forExpression.node = path.node;
    path.scope.data.for = path.scope.data.for || [];
    path.scope.data.for.push(forExpression);
}

export function getVarsScopeForLoop (path) {
    const list = [];
    const scoped = path.scope.data.for;

    if (scoped) {
        scoped.reduce((l, f) => { l.push(...f.args); return l; }, list);
    }

    return list;
}

export function removeScopeForLoop (path) {
    path.scope.data.for.pop();
}

export function hasScopeForLoop (path) {
    const forScope = path.scope.data.for;
    return forScope && forScope.length && forScope[forScope.length - 1].node === path.node;
}


// -- End for loop utils