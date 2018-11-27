import { echo, globalLibCall } from '../lib';

describe('lib.js', () => {
    it('returns string parameter passed to it', () => {
        const expected = "expected";
        const actual = echo(expected);
        expect(expected).toBe(actual);
    });

    it('gets globalLib mock from __mocks__', () => {
        expect(globalLibCall()).toBe("from __mocks__");
    });
});
