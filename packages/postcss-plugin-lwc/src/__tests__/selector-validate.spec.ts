import { process, FILE_NAME } from './shared';

describe('selector validation', () => {
    it('should restrict usage of deprecated /deep/ selector', () => {
        return expect(process(':host /deep/ a {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Invalid usage of deprecated selector "\/deep\/"/,
            ),
            file: FILE_NAME,
            line: 1,
            column: 7,
        });
    });

    it('should restrict usage of deprecated ::shadow pseudo-element selector', () => {
        return expect(process(':host::shadow a {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Invalid usage of deprecated selector "::shadow"/,
            ),
            file: FILE_NAME,
            line: 1,
            column: 6,
        });
    });

    it('should restrict usage of unsupported ::slotted pseudo-element selector', () => {
        return expect(process('::slotted a {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Invalid usage of unsupported selector "::slotted"/,
            ),
            file: FILE_NAME,
            line: 1,
            column: 1,
        });
    });

    it('should restrict usage of unsupported :root pseudo-element selector', () => {
        return expect(process(':root {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Invalid usage of unsupported selector ":root"/,
            ),
            file: FILE_NAME,
            line: 1,
            column: 1,
        });
    });

    it('should restrict usage of unsupported :host-context selector', () => {
        return expect(process(':host-context(.foo) {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Invalid usage of unsupported selector ":host-context"/,
            ),
            file: FILE_NAME,
            line: 1,
            column: 1,
        });
    });

    it.skip('should restrict usage of unsupported id selectors', () => {
        return expect(process('.foo #bar span')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Invalid usage of id selector "#bar". Use a class selector instead./
            ),
            file: FILE_NAME,
            line: 1,
            column: 1,
        });
    });
});

describe('attribute validation', () => {
    it('should allow global HTML attribute selectors', async () => {
        await expect(process('[hidden] {}')).resolves.toBeDefined();
        await expect(process('[lang="fr"] {}')).resolves.toBeDefined();
    });

    it('should allow custom attribute for known elements', async () => {
        await expect(process('input[min] {}')).resolves.toBeDefined();
        await expect(process('input[min][max] {}')).resolves.toBeDefined();

        await expect(process('div[min] {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Attribute \"min\" is not a known attribute on <div> element\./,
            ),
            file: FILE_NAME,
            line: 1,
            column: 4,
        });
    });

    it('should forbid usage of attributes on custom elements', async () => {
        await expect(process('x-foo[hidden] {}')).resolves.toBeDefined();
        await expect(process('x-foo[custom-attribute] {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Attribute \"custom-attribute\" is not a known attribute on <x-foo> element./,
            ),
            file: FILE_NAME,
            line: 1,
            column: 6,
        });
    });

    it('should forbid usage of unknown selector with out tag name', async () => {
        await expect(process('[my-title] {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /attributes that are not global attributes must be associated with a tag name/,
            ),
            file: FILE_NAME,
            line: 1,
            column: 2,
        });
        await expect(process('[my-lang="fr"] {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /attributes that are not global attributes must be associated with a tag name/,
            ),
            file: FILE_NAME,
            line: 1,
            column: 2,
        });
    });

    it('should allow usage of data-* attributes', async () => {
        await expect(process('[data-foo] {}')).resolves.toBeDefined();
        await expect(process('[data-foo="bar"] {}')).resolves.toBeDefined();
    });

    it('should forbid usage of the data attribute', async () => {
        await expect(process('[data] {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /attributes that are not global attributes must be associated with a tag name/,
            ),
            file: FILE_NAME,
            line: 1,
            column: 2,
        });
        await expect(process('div[data] {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Attribute \"data\" is not a known attribute on <div> element./,
            ),
            file: FILE_NAME,
            line: 1,
            column: 4,
        });
    });

    it('should allow usage of ARIA attributes', async () => {
        await expect(process('[aria-labelledby] {}')).resolves.toBeDefined();
        await expect(process('[aria-labelledby="bar"] {}')).resolves.toBeDefined();
    });
});
