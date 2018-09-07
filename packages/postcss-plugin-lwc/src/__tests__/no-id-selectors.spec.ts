import { process, FILE_NAME } from './shared';

describe('id selector validation', () => {
    it('should restrict usage of unsupported id selectors (simple)', () => {
        return expect(process('.foo #bar span {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Invalid usage of id selector '#bar'. Use a class selector instead./
            ),
            file: FILE_NAME,
            line: 1,
            column: 6,
        });
    });

    it('should restrict usage of unsupported id selectors (compound)', () => {
        return expect(process('#foo.active {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Invalid usage of id selector '#foo'. Use a class selector instead./
            ),
            file: FILE_NAME,
            line: 1,
            column: 2,
        });
    });

    it('should restrict usage of unsupported id selectors (pseudo class)', () => {
        return expect(process(':not(#baz) {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Invalid usage of id selector '#baz'. Use a class selector instead./
            ),
            file: FILE_NAME,
            line: 1,
            column: 6,
        });
    });

    it('should not restrict selectors that look like id selectors', () => {
        return expect(process('.foo a[href="http://example.com#anchor"] {}')).resolves.toMatchObject({});
    });
});
