import { worker } from 'workerpool';
import { transformSync, TransformOptions, TransformResult } from '@lwc/compiler';

function transform(src: string, filename: string, options: TransformOptions): TransformResult {
    return transformSync(src, filename, options);
}

worker({
    transform,
});
