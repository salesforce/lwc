/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { lwcRuntimeFlags, setFeatureFlag } from '../index';

describe('setFeatureFlag', () => {
    ['development', 'production'].forEach((env) => {
        describe(`${env} mode`, () => {
            let originalNodeEnv: any;
            let info: jest.SpyInstance;
            let error: jest.SpyInstance;

            beforeEach(() => {
                originalNodeEnv = process.env.NODE_ENV;
                process.env.NODE_ENV = env;
                info = jest.spyOn(console, 'info').mockImplementation(() => {});
                error = jest.spyOn(console, 'error').mockImplementation(() => {});
            });

            afterEach(() => {
                process.env.NODE_ENV = originalNodeEnv;
                lwcRuntimeFlags.PLACEHOLDER_TEST_FLAG = undefined; // reset
                info.mockReset();
                error.mockReset();
            });

            it('throws/logs and does nothing when set to a non-boolean', () => {
                const expectedError =
                    'Failed to set the value "foo" for the runtime feature flag "PLACEHOLDER_TEST_FLAG". Runtime feature flags can only be set to a boolean value.';
                const callback = () => {
                    // @ts-ignore
                    setFeatureFlag('PLACEHOLDER_TEST_FLAG', 'foo');
                };
                if (env === 'production') {
                    callback();
                    expect(error).toHaveBeenCalledWith(expectedError);
                } else {
                    expect(callback).toThrowError(expectedError);
                }

                // value is not changed
                expect(lwcRuntimeFlags.PLACEHOLDER_TEST_FLAG).toBeUndefined();
            });

            it('logs and does nothing when the flag is unknown', () => {
                // @ts-ignore
                setFeatureFlag('DOES_NOT_EXIST', true);
                expect(info).toHaveBeenCalledWith(
                    expect.stringMatching(/Attempt to set a value on an unknown feature flag/)
                );

                // value is not changed
                // @ts-ignore
                expect(lwcRuntimeFlags.DOES_NOT_EXIST).toBeUndefined();
            });

            it('disallows setting a flag more than once', () => {
                setFeatureFlag('PLACEHOLDER_TEST_FLAG', true);
                expect(lwcRuntimeFlags.PLACEHOLDER_TEST_FLAG).toEqual(true);
                setFeatureFlag('PLACEHOLDER_TEST_FLAG', false);
                if (env === 'production') {
                    expect(error).toHaveBeenCalledWith(
                        'Failed to set the value "false" for the runtime feature flag "PLACEHOLDER_TEST_FLAG". "PLACEHOLDER_TEST_FLAG" has already been set with the value "true".'
                    );
                    expect(lwcRuntimeFlags.PLACEHOLDER_TEST_FLAG).toEqual(true);
                } else {
                    expect(error).not.toHaveBeenCalled();
                    expect(lwcRuntimeFlags.PLACEHOLDER_TEST_FLAG).toEqual(false);
                }
            });
        });
    });
});
