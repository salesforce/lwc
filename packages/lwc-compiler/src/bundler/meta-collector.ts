import {
    ApiDecorator,
    TrackDecorator,
    WireDecorator
} from "babel-plugin-transform-lwc-class";

import { ModuleImportLocation } from "./import-location-collector";

export type MetadataDecorators = Array<
    ApiDecorator | TrackDecorator | WireDecorator
>;

export interface BundleMetadata {
    decorators: MetadataDecorators;
    importLocations: ModuleImportLocation[];
}

export class MetadataCollector {
    private decorators: Array<
        ApiDecorator | TrackDecorator | WireDecorator
    > = [];
    private importLocations: ModuleImportLocation[] = [];


    public collectDecorator(
        decorator: ApiDecorator | TrackDecorator | WireDecorator
    ) {
        this.decorators.push(decorator);
    }

    public collectImportLocations(importLocations: ModuleImportLocation[]) {
        this.importLocations.push(...importLocations);
    }

    public getMetadata(): BundleMetadata {
        return {
            decorators: this.decorators,
            importLocations: this.importLocations
        };
    }
}
