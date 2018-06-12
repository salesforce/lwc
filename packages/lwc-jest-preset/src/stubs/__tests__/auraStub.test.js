// use import like consuming components will, and point to generated file in `dist` folder
// via jest config

// eslint-disable-next-line lwc/no-compat-execute
import { labels, executeGlobalController } from 'aura';

describe('auraStub.js', () => {
    describe('labels', () => {
        it('function call returns undefined', () => {
            expect(labels({})).toBe(undefined);
        });
    });

    describe('executeGlobalController', () => {
        it('returns resolved Promise', () => {
            return expect(executeGlobalController()).resolves.toBe(undefined);
        });

        it('can be overridden with new implementation', () => {
            executeGlobalController.mockImplementation(() => Promise.resolve('new impl'));
            return expect(executeGlobalController()).resolves.toBe('new impl');
        });
    });
});
