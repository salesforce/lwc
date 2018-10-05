import { ResolvedConfig } from './config';
import { ModuleDependency } from "./shared/types";
import { IRElement, IRStringAttribute } from './shared/types';

interface AttributeItem {
    attr: IRStringAttribute;
    element: IRElement;
}

export default class State {
    code: string;
    config: ResolvedConfig;

    ids: string[] = [];
    slots: string[] = [];
    extendedDependencies: ModuleDependency[] = [];
    dependencies: string[] = [];
    elementIdAttrs: AttributeItem[] = [];
    elementIdRefAttrs: AttributeItem[] = [];

    constructor(code: string, config: ResolvedConfig) {
        this.code = code;
        this.config = config;
    }
}
