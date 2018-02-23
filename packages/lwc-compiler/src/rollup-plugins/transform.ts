import { getTransformer } from '../transformers/transformer';

import { NormalizedCompilerOptions } from "../options";

export default function({
    $metadata,
    options
}: {
    $metadata: any;
    options: NormalizedCompilerOptions;
}) {
    return {
        name: "lwc-file-transform",
        async transform(src: string, id: string) {
            const transform = getTransformer(id);
            const result = await transform(
                src,
                id,
                options,
            );

            $metadata[id] = result.metadata;
            return result;
        }
    };
}
