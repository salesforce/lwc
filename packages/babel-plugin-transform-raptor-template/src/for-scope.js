export default class {
    constructor () {
        this.scoped = [];
    }

    hasBinding(bindingName) {
        for (let i = 0; i < this.scoped.length; i++) {
            if (this.scoped[i] && this.scoped[i].bindings.indexOf(bindingName) !== -1) {
                return true;
            }
        }
        return false;
    }

    registerScopePathBindings(path, bindings) {
        this.scoped.push({ scope: path.node, bindings });
    }
    hasScope(path) {
        const peak = this.scoped[this.scoped.length - 1];
        return peak && peak.scope === path;
    }

    removeScopePathBindings() {
        console.log('remove');
        // Maybe add a guard for the right path?
        this.scoped.pop(); 
    }

    getAllBindings() {
        return this.scoped.reduce((l, f) => { l.push(...f.bindings); return l; }, []);
    }
};