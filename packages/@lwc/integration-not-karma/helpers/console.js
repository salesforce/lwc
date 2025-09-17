import { spyOn } from '@vitest/spy';

/**
 * A much simplified version of the spies originally used for Karma.
 * Should probably be eventually replaced with individual spies.
 */
export function spyConsole() {
    const log = spyOn(console, 'log');
    const warn = spyOn(console, 'warn');
    const error = spyOn(console, 'error');
    return {
        calls: {
            log: log.mock.calls,
            warn: warn.mock.calls,
            error: error.mock.calls,
        },
        reset() {
            log.mockRestore();
            warn.mockRestore();
            error.mockRestore();
        },
    };
}
