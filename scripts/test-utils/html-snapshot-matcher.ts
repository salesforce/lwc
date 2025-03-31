/**
 * The built-in `toMatchFileSnapshot` assertion does not provide a mechanism to intercept the on-disk content
 * (expected) prior to comparison to the in-memory content (actual). Because we want SSRv2 to be canonical
 * vis a vis the fixtures, there needs to be a way to modify the on-disk content prior to comparing to SSRv1
 * output.
 *
 * This Chai assertion provides a similar mechanism to what you get with `toMatchFileSnapshot`. If a fixture
 * is not present on disk when the SSRv1 tests are run, a new file will be generated. And if an SSRv2 fixture
 * is present on disk, it'll be modified to look like SSRv1 output prior to asserting equality.
 *
 * The one deficiency of `toMatchHtmlSnapshot` is that it doesn't support automatic snapshot updating. If you
 * need to update a fixture and you want SSRv1 to write its output to disk, the `.html` file must first be
 * deleted. An attempt was made to integrate with the internal Vitest plumbing to support this properly, but
 * the necessary objects are not exposed to outside consumers.
 *
 * The actual transformation of SSRv2-markup to SSRv1-markup is performed in `swapLwcStyleForStyleTag`.
 *
 * Adapted from https://github.com/vitest-dev/vitest/blob/0c2924b7aeb7eaf1b1fa0e78d2da76a7f3197b50/packages/vitest/src/integrations/snapshot/chai.ts
 */

import * as fs from 'node:fs/promises';
import { equals, type Assertion, type ChaiPlugin, type ExpectStatic } from '@vitest/expect';
import { swapLwcStyleForStyleTag } from './swap-lwc-style-for-style';

function createMismatchError<T = unknown>(
    message: string,
    expand: boolean | undefined,
    actual: T,
    expected: T
) {
    // TODO [W-17971915]: clean this up, potentially using AssertionError
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
