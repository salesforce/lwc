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
            }
        );
        return [
            sauceLabsLauncher({
                browserName: 'chrome',
                browserVersion: 'latest',
            }),
            // sauceLabsLauncher({
            //     browserName: 'firefox',
            //     browserVersion: 'latest',
            // }),
            // sauceLabsLauncher({
            //     browserName: 'safari',
            //     browserVersion: 'latest',
            // }),
            // ...(options.LEGACY_BROWSERS
            //     ? [
            //           sauceLabsLauncher({
            //               browserName: 'chrome',
            //               browserVersion: 'latest-2',
            //           }),
            //           sauceLabsLauncher({
            //               browserName: 'safari',
            //               browserVersion: 'latest-2',
            //               platformName: 'Mac 13', // update with new releases
            //           }),
            //       ]
            //     : []),
        ];
    } else {
        return [
            playwrightLauncher({ product: 'chromium' }),
            playwrightLauncher({ product: 'firefox' }),
            playwrightLauncher({ product: 'webkit' }),
        ];
    }
}
