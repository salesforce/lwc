import { process, FILE_NAME } from './shared';

test('Usage of deprecated /deep/ selector', () => {
    return expect(process(':host /deep/ a {}')).rejects.toMatchObject({
        message: expect.stringMatching(
            /Invalid usage of deprecated selector "\/deep\/"/,
        ),
        file: FILE_NAME,
        line: 1,
        column: 7,
    });
});

test('Usage of deprecated ::shadow pseudo-element selector', () => {
    return expect(process(':host::shadow a {}')).rejects.toMatchObject({
        message: expect.stringMatching(
            /Invalid usage of deprecated selector "::shadow"/,
        ),
        file: FILE_NAME,
        line: 1,
        column: 6,
    });
});

test('Usage of unsupported ::slotted pseudo-element selector', () => {
    return expect(process('::slotted a {}')).rejects.toMatchObject({
        message: expect.stringMatching(
            /Invalid usage of unsupported selector "::slotted"/,
        ),
        file: FILE_NAME,
        line: 1,
        column: 1,
    });
});

test('Usage of unsupported :root pseudo-element selector', () => {
    return expect(process(':root {}')).rejects.toMatchObject({
        message: expect.stringMatching(
            /Invalid usage of unsupported selector ":root"/,
        ),
        file: FILE_NAME,
        line: 1,
        column: 1,
    });
});
