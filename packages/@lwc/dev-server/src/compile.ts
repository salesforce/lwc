// given a component entry point, compile the component
import { TransformResult, transformSync } from '@lwc/compiler';

export function compile(src: string, filename: string): TransformResult {
    return transformSync(src, filename, {});
}
