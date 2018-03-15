import { getReferenceReport } from '../../references/html';

test('simple component', () => {
    expect(
        getReferenceReport(`<template><x-foo></x-foo></template>`, 'test.js').references,
    ).toEqual([
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 11,
                    length: 5,
                },
                {
                    start: 19,
                    length: 5,
                },
            ],
        },
    ]);
});

test('nested components', () => {
    expect(
        getReferenceReport(
            `<template><x-foo><x-bar></x-bar></x-foo><x-baz></x-baz></template>`,
            'test.js',
        ).references,
    ).toEqual([
        {
            id: 'x-bar',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 18,
                    length: 5,
                },
                {
                    start: 26,
                    length: 5,
                },
            ],
        },
        {
            id: 'x-foo',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 11,
                    length: 5,
                },
                {
                    start: 34,
                    length: 5,
                },
            ],
        },
        {
            id: 'x-baz',
            file: 'test.js',
            type: 'component',
            locations: [
                {
                    start: 41,
                    length: 5,
                },
                {
                    start: 49,
                    length: 5,
                },
            ],
        },
    ]);
});
