export default class {
    scoped: Array<any>;
    constructor () {
        this.scoped = [];
    }

    hasBinding(bindingName: string): boolean {
        for (let i = 0; i < this.scoped.length; i++) {
            if (this.scoped[i] && this.scoped[i].bindings.indexOf(bindingName) !== -1) {
                return true;
            }
        }
        return false;
    }

    registerScopePathBindings(path: any, bindings: Array<string>) {
        this.scoped.push({ scope: path.node, bindings });
    }
    hasScope(path: any): boolean {
        const peak = this.scoped[this.scoped.length - 1];
        return peak && peak.scope === path;
    }

    removeScopePathBindings() {
        // Maybe add a guard for the right path?
        this.scoped.pop();
    }

    getAllBindings(): Array<any> {
        return this.scoped.reduce((l: Array<any>, f: any): Array<any> => { l.push(...f.bindings); return l; }, []);
    }
}
