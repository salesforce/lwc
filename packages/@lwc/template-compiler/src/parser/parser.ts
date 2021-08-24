import { IRElement } from '../shared/types';

import { ResolvedConfig } from '../config';

import Warning from './warning';

export default class ParserCtx {
    private readonly source: String;
    readonly config: ResolvedConfig;

    readonly warning: Warning = new Warning();
    readonly seenIds: Set<string> = new Set();

    readonly parentStack: IRElement[] = [];

    constructor(source: String, config: ResolvedConfig) {
        this.source = source;
        this.config = config;
    }

    getSource(start: number, end: number): string {
        return this.source.slice(start, end);
    }

    get warnings() {
        return this.warning.warnings;
    }
}
