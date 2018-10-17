import {
    ApiDecorator,
    ModuleExports,
    TrackDecorator,
    WireDecorator,
    Location,
    ClassMember
} from "babel-plugin-transform-lwc-class";

import { TemplateModuleDependency } from "lwc-template-compiler";

import { ModuleImportLocation } from "./import-location-collector";

export type MetadataDecorators = Array<
    ApiDecorator | TrackDecorator | WireDecorator
>;

export interface TemplateModuleDependencies {
    templatePath: string;
    moduleDependencies: TemplateModuleDependency[];
}

export interface BundleMetadata {
    decorators: MetadataDecorators;
    importLocations: ModuleImportLocation[];
    classMembers: ClassMember[];
    declarationLoc?: Location;
    doc?: string;
    experimentalTemplateDependencies?: TemplateModuleDependencies[];
    exports: ModuleExports[];
}

export class MetadataCollector {
    private decorators: Array<
        ApiDecorator | TrackDecorator | WireDecorator
    > = [];
    private importLocations: ModuleImportLocation[] = [];
    private experimentalTemplateDependencies?: TemplateModuleDependencies[];
    private classMembers: ClassMember[] = [];
    private declarationLoc?: Location;
    private doc?: string;
    private exports: ModuleExports[] = [];

    public collectDecorator(
        decorator: ApiDecorator | TrackDecorator | WireDecorator
    ) {
        this.decorators.push(decorator);
    }

    public collectImportLocations(importLocations: ModuleImportLocation[]) {
        this.importLocations.push(...importLocations);
    }

    public collectClassMember(classMember: ClassMember) {
        this.classMembers.push(classMember);
    }

    public setDeclarationLoc(declarationLoc?: Location) {
        this.declarationLoc = declarationLoc;
    }

    public setDoc(doc?: string) {
        this.doc = doc;
    }

    public collectExports(exports: ModuleExports[]) {
        this.exports.push(...exports);
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
            decorators: this.decorators,
            importLocations: this.importLocations,
            classMembers: this.classMembers,
            declarationLoc: this.declarationLoc,
            doc: this.doc,
            experimentalTemplateDependencies: this.experimentalTemplateDependencies,
            exports: this.exports
        };
    }
}
