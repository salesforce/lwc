import { getReferenceReport } from '../../references/css';

test('single selector', () => {
    expect(getReferenceReport(`x-foo { color: red; }`, 'test.js').references).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 0,
                    length: 5,
                },
            ],
        },
    ]);
});

test('single selector with attributes', () => {
    expect(
        getReferenceReport(`x-foo[title="Hello"] { color: red; }`, 'test.js').references,
    ).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 0,
                    length: 5,
                },
            ],
        },
    ]);
});

test('selector chain', () => {
    expect(getReferenceReport(`header x-foo { color: red; }`, 'test.js').references).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 7,
                    length: 5,
                },
            ],
        },
    ]);
});

test('selector list', () => {
    expect(
        getReferenceReport(`header x-foo, div, x-bar { color: red; }`, 'test.js').references,
    ).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 7,
                    length: 5,
                },
            ],
        },
        {
            id: 'x-bar',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 19,
                    length: 5,
                },
            ],
        },
    ]);
});

test('multiline selector list', () => {
    expect(getReferenceReport(`x-foo,\nx-bar { color: red; }`, 'test.js').references).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 0,
                    length: 5,
                },
            ],
        },
        {
            id: 'x-bar',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 7,
                    length: 5,
                },
            ],
        },
    ]);
});

test('ugly selector list', () => {
    expect(
        getReferenceReport(
            `      x-foo, p      .foo,  \nx-bar {\n  color  : red ;\n }`,
            'test.js',
        ).references,
    ).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 6,
                    length: 5,
                },
            ],
        },
        {
            id: 'x-bar',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 28,
                    length: 5,
                },
            ],
        },
    ]);
});

test('multiple rules', () => {
    expect(
        getReferenceReport(
            `x-foo {\ncolor: red;\n }\n \nx-bar {\ncolor: red;\n}`,
            'test.js',
        ).references,
    ).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 0,
                    length: 5,
                },
            ],
        },
        {
            id: 'x-bar',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 25,
                    length: 5,
                },
            ],
        },
    ]);
});


test('single selector', () => {
    expect(getReferenceReport(`x-foo { color: red; }`, 'test.js').references).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 0,
                    length: 5,
                },
            ],
        },
    ]);
});

test('single selector with attributes', () => {
    expect(
        getReferenceReport(`x-foo[title="Hello"] { color: red; }`, 'test.js').references,
    ).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 0,
                    length: 5,
                },
            ],
        },
    ]);
});

test('selector chain', () => {
    expect(getReferenceReport(`header x-foo { color: red; }`, 'test.js').references).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 7,
                    length: 5,
                },
            ],
        },
    ]);
});

test('selector list', () => {
    expect(
        getReferenceReport(`header x-foo, div, x-bar { color: red; }`, 'test.js').references,
    ).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 7,
                    length: 5,
                },
            ],
        },
        {
            id: 'x-bar',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 19,
                    length: 5,
                },
            ],
        },
    ]);
});

test('multiline selector list', () => {
    expect(getReferenceReport(`x-foo,\nx-bar { color: red; }`, 'test.js').references).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 0,
                    length: 5,
                },
            ],
        },
        {
            id: 'x-bar',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 7,
                    length: 5,
                },
            ],
        },
    ]);
});

test('ugly selector list', () => {
    expect(
        getReferenceReport(
            `      x-foo, p      .foo,  \nx-bar {\n  color  : red ;\n }`,
            'test.js',
        ).references,
    ).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 6,
                    length: 5,
                },
            ],
        },
        {
            id: 'x-bar',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 28,
                    length: 5,
                },
            ],
        },
    ]);
});

test('multiple rules', () => {
    expect(
        getReferenceReport(
            `x-foo {\ncolor: red;\n }\n \nx-bar {\ncolor: red;\n}`,
            'test.js',
        ).references,
    ).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 0,
                    length: 5,
                },
            ],
        },
        {
            id: 'x-bar',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 25,
                    length: 5,
                },
            ],
        },
    ]);
});
