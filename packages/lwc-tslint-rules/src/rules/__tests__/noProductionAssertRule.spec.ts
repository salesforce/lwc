import { runLintRule } from 'test-utils';

const rule = 'no-production-assert';

describe('no-production-assert', () => {
    it(`should fail when an assert is called and dont have the production check.`, () => {
        const src = `assert.logger.logWarning('this is leaking to prod');`;
        const result = runLintRule({src, rule});
        expect(result.errorCount).toBe(1);
    });

    it(`should not fail when an assert is called.`, () => {
        const src = `
        if (process.env.NODE_ENV !== 'production') {
            assert.logWarning('this assert is fine');
        }
    `;
        const result = runLintRule({src, rule});
        expect(result.errorCount).toBe(0);
    });

    it(`should analize else and fail when an assert is called.`, () => {
        const src = `
        if (process.env.NODE_ENV !== 'production') {
            assert.logWarning('this assert is fine');
        } else {
            assert.logWarning('this is leaking to prod');
        }
    `;
        const result = runLintRule({src, rule});
        expect(result.errorCount).toBe(1);
    });
});
