import { ResolvedConfig } from './config';
import { DependencyMetadata } from "./shared/types";

export default class State {
    code: string;
    config: ResolvedConfig;

    ids: string[] = [];
    slots: string[] = [];
    extendedDependencies: DependencyMetadata[] = [];
    dependencies: string[] = [];

    constructor(code: string, config: ResolvedConfig) {
        this.code = code;
        this.config = config;
    }
}
