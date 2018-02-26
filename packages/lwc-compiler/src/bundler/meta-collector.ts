import {
    ApiDecorator,
    TrackDecorator,
    WireDecorator
} from "babel-plugin-transform-lwc-class";
import { BundleMetadata } from "./bundler";

export interface ExternalReference {
    name: string;
    type: string;
}

export class MetadataCollector {
    private references: Map<String, ExternalReference>;
    private decorators: Array<ApiDecorator | TrackDecorator | WireDecorator>;

    constructor() {
        this.decorators = [];
        this.references = new Map<string, ExternalReference>();
    }

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
        const result = {
            references: [...this.references.values()],
            decorators: this.decorators
        };
        return result;
    }
}
