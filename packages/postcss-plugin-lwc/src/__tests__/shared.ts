import * as postcss from 'postcss';
import lwcPlugin from '../index';

export const FILE_NAME = '/test.css';
export const DEFAULT_TAGNAME = 'x-foo';
export const DEFAULT_TOKEN = 'x-foo_tmpl';

export function process(
    source: string,
    options: any = { tagName: DEFAULT_TAGNAME, token: DEFAULT_TOKEN },
) {
    const plugins = [lwcPlugin(options)];
    return postcss(plugins).process(source, { from: FILE_NAME });
}
