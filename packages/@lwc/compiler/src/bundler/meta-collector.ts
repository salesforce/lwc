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

import { ModuleImportLocation } from "./import-location-collector";

export interface TemplateModuleDependencies {
    templatePath: string;
    moduleDependencies: TemplateModuleDependency[];
}

export interface BundleMetadata {
    importLocations: ModuleImportLocation[];
    declarationLoc?: Location;
    experimentalTemplateDependencies?: TemplateModuleDependencies[];
}

export class MetadataCollector {
    private importLocations: ModuleImportLocation[] = [];
    private experimentalTemplateDependencies?: TemplateModuleDependencies[];
    private declarationLoc?: Location;

    public collectImportLocations(importLocations: ModuleImportLocation[]) {
        this.importLocations.push(...importLocations);
    }

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
            importLocations: this.importLocations,
            declarationLoc: this.declarationLoc,
            experimentalTemplateDependencies: this.experimentalTemplateDependencies,
        };
    }
}
