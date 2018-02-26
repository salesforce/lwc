import { getTransformer } from '../transformers/transformer';

import { NormalizedCompilerOptions } from "../options";
import { MetadataCollector } from '../bundler/meta-collector';

export default function({
    options,
    metadataCollector,
}: {
    options: NormalizedCompilerOptions;
    metadataCollector?: MetadataCollector
}) {
    return {
        name: "lwc-file-transform",
        async transform(src: string, id: string) {
            const transform = getTransformer(id);
            const result = await transform(
                src,
                id,
                options,
                metadataCollector,
            );
            return result;
        }
    };
}
