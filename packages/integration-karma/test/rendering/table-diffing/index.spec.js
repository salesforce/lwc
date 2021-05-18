import { createElement } from 'lwc';

import Table from 'x/table';

describe('Table diffing', () => {
    it('should create new items to the list', () => {
        const elm = createElement('x-table', { is: Table });
        elm.rows = [{ id: 0 }, { id: 1 }, { id: 2 }];
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelectorAll('x-row').length).toBe(3);
    });

    it('should reuse existing component if the data is unchanged', () => {
        const elm = createElement('x-table', { is: Table });
        elm.rows = [{ id: 0 }, { id: 1 }, { id: 2 }];
        document.body.appendChild(elm);

        const [e1, e2, e3] = elm.shadowRoot.querySelectorAll('x-row');
        elm.rows = [...elm.rows, { id: 3 }, { id: 4 }];

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelectorAll('x-row').length).toBe(5);
            const [r1, r2, r3] = elm.shadowRoot.querySelectorAll('x-row');
            expect(r1).toBe(e1);
            expect(r2).toBe(e2);
            expect(r3).toBe(e3);
        });
    });

    it('should reuse the elements when reversing the data', () => {
        const data = [{ id: 0 }, { id: 1 }, { id: 2 }];

        const elm = createElement('x-table', { is: Table });
        elm.rows = [...data];
        document.body.appendChild(elm);

        const [e1, e2, e3] = elm.shadowRoot.querySelectorAll('x-row');
        elm.rows = [...data].reverse();

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelectorAll('x-row').length).toBe(3);
            const [r1, r2, r3] = elm.shadowRoot.querySelectorAll('x-row');
            expect(r1).toBe(e3);
            expect(r2).toBe(e2);
            expect(r3).toBe(e1);
        });
    });

    it('should reuse the elements when removing and adding data at the beginning and the end', () => {
        const elm = createElement('x-table', { is: Table });
        elm.rows = [{ id: 0 }, { id: 1 }, { id: 2 }];
        document.body.appendChild(elm);

        const [, e2, e3] = elm.shadowRoot.querySelectorAll('x-row');
        elm.rows = [{ id: 2 }, { id: 1 }, { id: 3 }];

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelectorAll('x-row').length).toBe(3);
            const [r1, r2] = elm.shadowRoot.querySelectorAll('x-row');
            expect(r1).toBe(e3);
            expect(r2).toBe(e2);
        });
    });
});
