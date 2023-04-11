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
            let warn: jest.SpyInstance;
            let error: jest.SpyInstance;

            beforeEach(() => {
                originalNodeEnv = process.env.NODE_ENV;
                process.env.NODE_ENV = env;
                warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
                error = jest.spyOn(console, 'error').mockImplementation(() => {});
            });

            afterEach(() => {
                process.env.NODE_ENV = originalNodeEnv;
                lwcRuntimeFlags.DUMMY_TEST_FLAG = undefined; // reset
                warn.mockReset();
                error.mockReset();
            });

            it('throws/logs and does nothing when set to a non-boolean', () => {
                const expectedError =
                    'Failed to set the value "foo" for the runtime feature flag "DUMMY_TEST_FLAG". Runtime feature flags can only be set to a boolean value.';
                const callback = () => {
                    // @ts-ignore
                    setFeatureFlag('DUMMY_TEST_FLAG', 'foo');
                };
                if (env === 'production') {
                    callback();
                    expect(error).toHaveBeenCalledWith(expectedError);
                } else {
                    expect(callback).toThrowError(expectedError);
                }

                // value is not changed
                expect(lwcRuntimeFlags.DUMMY_TEST_FLAG).toBeUndefined();
            });

            it('logs and does nothing when the flag is unknown', () => {
                // @ts-ignore
                setFeatureFlag('DOES_NOT_EXIST', true);
                expect(warn).toHaveBeenCalledWith(
                    expect.stringMatching(
                        /Failed to set the value "true" for the runtime feature flag "DOES_NOT_EXIST" because it is undefined\./
                    )
                );

                // value is not changed
                // @ts-ignore
                expect(lwcRuntimeFlags.DOES_NOT_EXIST).toBeUndefined();
            });

            it('disallows setting a flag more than once', () => {
                setFeatureFlag('DUMMY_TEST_FLAG', true);
                expect(lwcRuntimeFlags.DUMMY_TEST_FLAG).toEqual(true);
                setFeatureFlag('DUMMY_TEST_FLAG', false);
                if (env === 'production') {
                    expect(error).toHaveBeenCalledWith(
                        'Failed to set the value "false" for the runtime feature flag "DUMMY_TEST_FLAG". "DUMMY_TEST_FLAG" has already been set with the value "true".'
                    );
                    expect(lwcRuntimeFlags.DUMMY_TEST_FLAG).toEqual(true);
                } else {
                    expect(error).not.toHaveBeenCalled();
                    expect(lwcRuntimeFlags.DUMMY_TEST_FLAG).toEqual(false);
                }
            });
        });
    });
});
