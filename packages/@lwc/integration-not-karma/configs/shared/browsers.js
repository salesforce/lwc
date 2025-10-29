import { playwrightLauncher } from '@web/test-runner-playwright';
import { createSauceLabsLauncher } from '@web/test-runner-saucelabs';

/** @type {(options: typeof import('../../helpers/options.js')) => import("@web/test-runner").BrowserLauncher[]} */
export function getBrowsers(options) {
    if (options.CI) {
        if (!options.SAUCE_USERNAME || !options.SAUCE_ACCESS_KEY || !options.SAUCE_TUNNEL_ID) {
            throw new Error(
                `SAUCE_USERNAME, SAUCE_ACCESS_KEY, and SAUCE_TUNNEL_ID must be configured in CI`
            );
        }
        const sauceLabsLauncher = createSauceLabsLauncher(
            {
                user: options.SAUCE_USERNAME,
                key: options.SAUCE_ACCESS_KEY,
            },
            {
                tunnelName: options.SAUCE_TUNNEL_ID,
                idleTimeout: 1e9,
                commandTimeout: 1e9,
                sessionCreationTimeout: 1e9,
            }
        );

        const timeouts = {
            implicit: 1e9,
            pageLoad: 1e9,
            script: 1e9,
        };

        // "Legacy" isn't actually all that old...
        return options.LEGACY_BROWSERS
            ? [
                  sauceLabsLauncher({
                      timeouts,
                      browserName: 'chrome',
                      browserVersion: 'latest-2',
                  }),
                  sauceLabsLauncher({
                      timeouts,
                      browserName: 'safari',
                      browserVersion: 'latest-2',
                      platformName: 'Mac 13', // update with new releases
                  }),
              ]
            : [
                  sauceLabsLauncher({
                      timeouts,
                      browserName: 'chrome',
                      browserVersion: 'latest',
                  }),
                  sauceLabsLauncher({
                      timeouts,
                      browserName: 'firefox',
                      browserVersion: 'latest',
                  }),
                  sauceLabsLauncher({
                      timeouts,
                      browserName: 'safari',
                      browserVersion: 'latest',
                  }),
              ];
    } else {
        return [
            playwrightLauncher({ product: 'chromium' }),
            playwrightLauncher({ product: 'firefox' }),
            playwrightLauncher({ product: 'webkit' }),
        ];
    }
}
