export default class {
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

    registerScopePathBindings(path: any, bindings: Array<string>, varDeclarations: Array<any>) {
        varDeclarations = varDeclarations || [];
        bindings = bindings || [];
        this.scoped.push({ scope: path.node, bindings, varDeclarations });
    }

    getAllVarDeclarations() {
        const peak = this.scoped[this.scoped.length - 1];
        return peak.varDeclarations;
    }

    pushVarDeclaration(varDeclaration: any) {
        const peak = this.scoped[this.scoped.length - 1];
        peak.varDeclarations.push(varDeclaration);
    }
    pushBindings(bindings: any) {
        const peak = this.scoped[this.scoped.length - 1];
        peak.bindings.push.apply(peak.bindings, bindings);
    }

    hasScope(path: any): boolean {
        const peak = this.scoped[this.scoped.length - 1];
        return peak && peak.scope === path;
    }

    removeScopePathBindings(/*path*/) {
        // Maybe add a guard for the right path?
         this.scoped.pop();
        //const node = this.scoped.pop();
        // node.varDeclarations.forEach((v) => {
        //     path.scope.push(v);
        // });
    }

    getAllBindings(): Array<any> {
        return this.scoped.reduce((l: Array<any>, f: any): Array<any> => { l.push(...f.bindings); return l; }, []);
    }
}
