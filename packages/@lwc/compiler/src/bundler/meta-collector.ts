/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    Location,
} from "@lwc/babel-plugin-component";

import { TemplateModuleDependency } from "@lwc/template-compiler";

export interface TemplateModuleDependencies {
    templatePath: string;
    moduleDependencies: TemplateModuleDependency[];
}

export interface BundleMetadata {
    declarationLoc?: Location;
    experimentalTemplateDependencies?: TemplateModuleDependencies[];
}

export class MetadataCollector {
    private experimentalTemplateDependencies?: TemplateModuleDependencies[];
    private declarationLoc?: Location;

    public setDeclarationLoc(declarationLoc?: Location) {
        this.declarationLoc = declarationLoc;
    }

    public collectExperimentalTemplateDependencies(
        templatePath: string, templateDependencies: TemplateModuleDependency[]) {
        if (!this.experimentalTemplateDependencies) {
            this.experimentalTemplateDependencies = [];
        }
        this.experimentalTemplateDependencies.push({
            templatePath,
            moduleDependencies: templateDependencies
        });
    }

    public getMetadata(): BundleMetadata {
        return {
            declarationLoc: this.declarationLoc,
            experimentalTemplateDependencies: this.experimentalTemplateDependencies,
        };
    }
}
