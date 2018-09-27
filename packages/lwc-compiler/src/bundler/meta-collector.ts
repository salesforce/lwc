import {
    ApiDecorator,
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

export interface BundleMetadata {
    decorators: MetadataDecorators;
    importLocations: ModuleImportLocation[];
    classMembers: ClassMember[];
    declarationLoc?: Location;
    doc?: string;
    experimentalTemplateDependencies?: TemplateModuleDependency[];
}

export class MetadataCollector {
    private decorators: Array<
        ApiDecorator | TrackDecorator | WireDecorator
    > = [];
    private importLocations: ModuleImportLocation[] = [];
    private experimentalTemplateDependencies?: TemplateModuleDependency[] = [];
    private classMembers: ClassMember[] = [];
    private declarationLoc?: Location;
    private doc?: string;

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

    public setExperimentalTemplateDependencies(templateDependencies?: TemplateModuleDependency[]) {
        this.experimentalTemplateDependencies = templateDependencies;
    }

    public getMetadata(): BundleMetadata {
        return {
            decorators: this.decorators,
            importLocations: this.importLocations,
            classMembers: this.classMembers,
            declarationLoc: this.declarationLoc,
            doc: this.doc,
            experimentalTemplateDependencies: this.experimentalTemplateDependencies
        };
    }
}
