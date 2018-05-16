import { process, DEFAULT_TAGNAME } from './shared';

describe('validate options', () => {
    it('assert tagName option', () => {
        expect(() => process('', {})).toThrow(
            /tagName option must be a string but instead received undefined/,
        );
    });

    it('assert token option', () => {
        expect(() => process('', { tagName: DEFAULT_TAGNAME })).toThrow(
            /token option must be a string but instead received undefined/,
        );
    });
});
