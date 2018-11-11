import { MarkupData } from 'parse5-with-errors';

import { ResolvedConfig } from './config';
import { ModuleDependency } from "./shared/types";
import { Statement, ImportDeclaration } from '@babel/types';

export interface IdAttributeData {
    key: number;
    location: MarkupData.Location;
    value: string;
}
export interface IdrefAttributeData {
    key: number;
    location: MarkupData.Location;
    name: string;
    values: string[];
}

export default class State {
    code: string;
    config: ResolvedConfig;

    ids: string[] = [];
    slots: string[] = [];
    extendedDependencies: ModuleDependency[] = [];
    dependencies: string[] = [];

    inlineStyle: {
        body: Statement[],
        imports: ImportDeclaration[]
    } = {
        body: [],
        imports: []
    };

    idAttrData: IdAttributeData[] = [];
    idrefAttrData: IdrefAttributeData[] = [];

    constructor(code: string, config: ResolvedConfig) {
        this.code = code;
        this.config = config;
    }
}
