import { MarkupData } from 'parse5-with-errors';

import { ResolvedConfig } from './config';
import { ModuleDependency } from "./shared/types";

export interface IdAttributeData {
    key: number;
    location: MarkupData.Location;
    value: string;
}
export default class State {
    code: string;
    config: ResolvedConfig;

    ids: string[] = [];
    slots: string[] = [];
    extendedDependencies: ModuleDependency[] = [];
    dependencies: string[] = [];

    idAttrData: IdAttributeData[] = [];

    constructor(code: string, config: ResolvedConfig) {
        this.code = code;
        this.config = config;
    }
}
