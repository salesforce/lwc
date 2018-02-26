import { getTransformer } from '../transformers/transformer';

import { NormalizedCompilerOptions } from "../options";

export default function({
    collect,
    options
}: {
    collect: any
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

            collect(id, result.metadata);
            return result;
        }
    };
}
