import { createElement } from 'lwc';
import { itWithLightDOM } from 'test-utils';

import Table from 'x/table';

describe('Table diffing', () => {
    itWithLightDOM('should create new items to the list', Table, (shadow) => () => {
        const elm = createElement('x-table', { is: Table });
        const template = shadow ? elm.shadowRoot : elm;
        elm.rows = [{ id: 0 }, { id: 1 }, { id: 2 }];
        document.body.appendChild(elm);

        expect(template.querySelectorAll('x-row').length).toBe(3);
    });

    itWithLightDOM(
        'should reuse existing component if the data is unchanged',
        Table,
        (shadow) => () => {
            const elm = createElement('x-table', { is: Table });
            const template = shadow ? elm.shadowRoot : elm;
            elm.rows = [{ id: 0 }, { id: 1 }, { id: 2 }];
            document.body.appendChild(elm);

            const [e1, e2, e3] = template.querySelectorAll('x-row');
            elm.rows = [...elm.rows, { id: 3 }, { id: 4 }];

            return Promise.resolve().then(() => {
                expect(template.querySelectorAll('x-row').length).toBe(5);
                const [r1, r2, r3] = template.querySelectorAll('x-row');
                expect(r1).toBe(e1);
                expect(r2).toBe(e2);
                expect(r3).toBe(e3);
            });
        }
    );

    itWithLightDOM('should reuse the elements when reversing the data', Table, (shadow) => () => {
        const data = [{ id: 0 }, { id: 1 }, { id: 2 }];

        const elm = createElement('x-table', { is: Table });
        const template = shadow ? elm.shadowRoot : elm;
        elm.rows = [...data];
        document.body.appendChild(elm);

        const [e1, e2, e3] = template.querySelectorAll('x-row');
        elm.rows = [...data].reverse();

        return Promise.resolve().then(() => {
            expect(template.querySelectorAll('x-row').length).toBe(3);
            const [r1, r2, r3] = template.querySelectorAll('x-row');
            expect(r1).toBe(e3);
            expect(r2).toBe(e2);
            expect(r3).toBe(e1);
        });
    });

    itWithLightDOM(
        'should reuse the elements when removing and adding data at the beginning and the end',
        Table,
        (shadow) => () => {
            const elm = createElement('x-table', { is: Table });
            const template = shadow ? elm.shadowRoot : elm;
            elm.rows = [{ id: 0 }, { id: 1 }, { id: 2 }];
            document.body.appendChild(elm);

            const [, e2, e3] = template.querySelectorAll('x-row');
            elm.rows = [{ id: 2 }, { id: 1 }, { id: 3 }];

            return Promise.resolve().then(() => {
                expect(template.querySelectorAll('x-row').length).toBe(3);
                const [r1, r2] = template.querySelectorAll('x-row');
                expect(r1).toBe(e3);
                expect(r2).toBe(e2);
            });
        }
    );
});
