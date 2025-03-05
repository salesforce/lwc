// adapted from https://github.com/vitest-dev/vitest/blob/0c2924b7aeb7eaf1b1fa0e78d2da76a7f3197b50/packages/vitest/src/integrations/snapshot/chai.ts

import * as fs from 'node:fs/promises';
import { equals, type Assertion, type ChaiPlugin, type ExpectStatic } from '@vitest/expect';
import { swapLwcStyleForStyleTag } from './swap-lwc-style-for-style';

function createMismatchError(
    message: string,
    expand: boolean | undefined,
    actual: unknown,
    expected: unknown
) {
    const error = new Error(message);
    Object.defineProperty(error, 'actual', {
        value: actual,
        enumerable: true,
        configurable: true,
        writable: true,
    });
    Object.defineProperty(error, 'expected', {
        value: expected,
        enumerable: true,
        configurable: true,
        writable: true,
    });
    Object.defineProperty(error, 'diffOptions', { value: { expand } });
    return error;
}

async function fileExists(fpath: string) {
    try {
        return (await fs.stat(fpath)).isFile();
    } catch (_err) {
        return false;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Chai {
        interface Assertion {
            toMatchHtmlSnapshot(htmlFilePath: string, expect: ExpectStatic): Promise<void>;
        }
    }
}

export const HtmlSnapshotPlugin: ChaiPlugin = (chai, utils) => {
    utils.addMethod(
        chai.Assertion.prototype,
        'toMatchHtmlSnapshot',
        async function (this: Assertion, htmlFilePath: string, expect: ExpectStatic) {
            utils.flag(this, '_name', 'toMatchHtmlSnapshot');

            const expectedHtml = utils.flag(this, 'object');
            const isNot = utils.flag(this, 'negate');
            if (isNot) {
                throw new Error('toMatchHtmlSnapshot cannot be used with "not"');
            }

            // Leverage the built-in mechanism to write new fixtures to disk.
            if (!(await fileExists(htmlFilePath))) {
                return await expect(expectedHtml).toMatchFileSnapshot(htmlFilePath);
            }

            const actualHtml = await fs.readFile(htmlFilePath, 'utf8');
            const actualHtmlCompatWithSSRv1 = swapLwcStyleForStyleTag(actualHtml);

            // This isn't strictly necessary because we await the assertion in `test-fixture-dir.ts`.
            // However, it mimics the behavior exhibited by `toMatchFileSnapshot` such that, if the
            // assertion were not awaited, any failed assertions would be queued up and reported
            // asynchronously after the test completed.
            if (!equals(actualHtmlCompatWithSSRv1, expectedHtml)) {
                throw createMismatchError(
                    'HTML snapshot mismatch',
                    true,
                    actualHtmlCompatWithSSRv1,
                    expectedHtml
                );
            }
        }
    );
};
