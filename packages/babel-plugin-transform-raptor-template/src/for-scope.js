export const customScope = {
    scoped: [],
    hasBinding(bindingName) {
        for (let i = 0; i < this.scoped.length; i++) {
            if (this.scoped[i] && this.scoped[i].bindings.indexOf(bindingName) !== -1) {
                return true;
            }
        }
        return false;
    },
    registerBindings(path, bindings) {
        this.scoped.push({ scope: path.node, bindings });
    },
    removeBindings(path) {
        this.scoped.pop();
    },
    getAllBindings() {
        return this.scoped.reduce((l, f) => { l.push(...f.bindings); return l; }, []);
    }
};


// -- REFACTOR this
// -- For loop utils
export function addScopeForLoop(path, forExpression) {
    forExpression.node = path.node;
    path.scope.data.for = path.scope.data.for || [];
    path.scope.data.for.push(forExpression);
    customScope.registerBindings(path, forExpression.args);
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
    customScope.removeBindings(path);
}

export function hasScopeForLoop (path) {
    const forScope = path.scope.data.for;
    return forScope && forScope.length && forScope[forScope.length - 1].node === path.node;
}
