import { createElement } from 'lwc';

import Dynamic from 'x/dynamic';
import Static from 'x/staticallyOptimized';

describe('dynamic style attributes', () => {
    const scenarios = [
        { dataType: 'object', test: 'showObj', tagName: 'h1' },
        { dataType: 'boolean', test: 'showBool', tagName: 'h4' },
        { dataType: 'number', test: 'showNum', tagName: 'h5' },
    ];
    [Dynamic, Static].forEach((ctor) => {
        scenarios.forEach(({ dataType, test, tagName }) => {
            it(`throws an error when ${dataType} value used - statically optimized ${
                ctor === Static
            }`, () => {
                const elm = createElement('x-invalid-style', { is: ctor });
                elm[test] = true;
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogErrorDev(
                    new RegExp(
                        `Invalid 'style' attribute passed to <${tagName}> is ignored. This attribute must be a string value.`
                    )
                );
            });
        });
    });
});
