import { playwrightLauncher } from '@web/test-runner-playwright';
import { createSauceLabsLauncher } from '@web/test-runner-saucelabs';

/** @type {(options: typeof import('../../helpers/options.js')) => import("@web/test-runner").BrowserLauncher[]} */
export function getBrowsers(options) {
    if (options.USE_SAUCE) {
        if (!options.SAUCE_USERNAME || !options.SAUCE_ACCESS_KEY || !options.SAUCE_TUNNEL_ID) {
            throw new Error(
                'SAUCE_USERNAME, SAUCE_ACCESS_KEY, and SAUCE_TUNNEL_ID must be configured to use SauceLabs.'
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
            sauceLabsLauncher({
                browserName: 'firefox',
                browserVersion: 'latest',
            }),
            sauceLabsLauncher({
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
