import { ResolvedConfig } from './config';
import {TemplateDependencyMetadata} from "./shared/types";

export default class State {
    code: string;
    config: ResolvedConfig;

    ids: string[] = [];
    slots: string[] = [];
    alternativeDependencies: TemplateDependencyMetadata[] = [];
    dependencies: string[] = [];

    constructor(code: string, config: ResolvedConfig) {
        this.code = code;
        this.config = config;
    }
}
