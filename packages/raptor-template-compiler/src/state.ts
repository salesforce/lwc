import { ResolvedConfig } from './config';

export default class State {
    code: string;
    config: ResolvedConfig;

    ids: string[] = [];
    slots: string[] = [];
    dependencies: string[] = [];

    constructor(code: string, config: ResolvedConfig) {
        this.code = code;
        this.config = config;
    }
}
