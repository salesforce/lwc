import { Diagnostic, DiagnosticLevel } from './diagnostic';

export class DiagnosticCollector {
    private diagnostics: Diagnostic[] = [];

    constructor(diagnostics?: Diagnostic[]) {
        if (diagnostics) {
            this.addAll(diagnostics);
        }
    }
    public getAll() {
        return this.diagnostics;
    }

    public addAll(items: Diagnostic[]) {
        if (!Array.isArray(items)) {
            return;
        }
        for (const item of items) {
            this.add(item);
        }
    }

    public add(item: Diagnostic) {
        this.diagnostics.push(item);
    }

    public hasError() {
        return this.diagnostics.some(d => {
            return d.level <= DiagnosticLevel.Error;
        });
    }
}
