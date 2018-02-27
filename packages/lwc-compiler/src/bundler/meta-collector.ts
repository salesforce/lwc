import {
    ApiDecorator,
    TrackDecorator,
    WireDecorator
} from "babel-plugin-transform-lwc-class";
import { BundleMetadata } from "./bundler";

export interface ExternalReference {
    name: string;
    type: "module" | "component";
}

export class MetadataCollector {
    private references: Map<String, ExternalReference> = new Map();
    private decorators: Array<ApiDecorator | TrackDecorator | WireDecorator> = [];

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

    public getMetadata(): BundleMetadata {
        return {
            references: Array.from(this.references.values()),
            decorators: this.decorators
        };
    }
}
