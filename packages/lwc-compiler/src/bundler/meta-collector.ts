import {
    ApiDecorator,
    TrackDecorator,
    WireDecorator
} from "babel-plugin-transform-lwc-class";
import { BundleMetadata } from "./bundler";
import { ModuleImportLocation } from "./import-location-collector";

export interface ExternalReference {
    name: string;
    type: "module" | "component";
}

export class MetadataCollector {
    private references: Map<String, ExternalReference> = new Map();
    private decorators: Array<ApiDecorator | TrackDecorator | WireDecorator> = [];
    private importLocations: ModuleImportLocation[] = [];

    public collectReference(reference: ExternalReference) {
        const existingRef = this.references.get(reference.name);

        // js file that has corresponding html must be of type 'component'
        if (!existingRef || existingRef.type !== "component") {
            this.references.set(reference.name, reference);
        }
    }

    public collectDecorator(
        decorator: ApiDecorator | TrackDecorator | WireDecorator
    ) {
        this.decorators.push(decorator);
    }

    public collectImportLocations(importLocations: ModuleImportLocation []) {
        this.importLocations.push(...importLocations);
    }

    public getMetadata(): BundleMetadata {
        return {
            references: Array.from(this.references.values()),
            decorators: this.decorators,
            importLocations: this.importLocations,
        };
    }
}
