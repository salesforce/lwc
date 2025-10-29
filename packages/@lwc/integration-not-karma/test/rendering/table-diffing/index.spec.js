import { createElement } from 'lwc';

import Table from 'c/table';

describe('Table diffing', () => {
    it('should create new items to the list', () => {
        const elm = createElement('c-table', { is: Table });
        elm.rows = [{ id: 0 }, { id: 1 }, { id: 2 }];
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelectorAll('c-row').length).toBe(3);
    });

    it('should reuse existing component if the data is unchanged', async () => {
        const elm = createElement('c-table', { is: Table });
        elm.rows = [{ id: 0 }, { id: 1 }, { id: 2 }];
        document.body.appendChild(elm);

        const [e1, e2, e3] = elm.shadowRoot.querySelectorAll('c-row');
        elm.rows = [...elm.rows, { id: 3 }, { id: 4 }];

        await Promise.resolve();
        expect(elm.shadowRoot.querySelectorAll('c-row').length).toBe(5);
        const [r1, r2, r3] = elm.shadowRoot.querySelectorAll('c-row');
        expect(r1).toBe(e1);
        expect(r2).toBe(e2);
        expect(r3).toBe(e3);
    });

    it('should reuse the elements when reversing the data', async () => {
        const data = [{ id: 0 }, { id: 1 }, { id: 2 }];

        const elm = createElement('c-table', { is: Table });
        elm.rows = [...data];
        document.body.appendChild(elm);

        const [e1, e2, e3] = elm.shadowRoot.querySelectorAll('c-row');
        elm.rows = [...data].reverse();

        await Promise.resolve();
        expect(elm.shadowRoot.querySelectorAll('c-row').length).toBe(3);
        const [r1, r2, r3] = elm.shadowRoot.querySelectorAll('c-row');
        expect(r1).toBe(e3);
        expect(r2).toBe(e2);
        expect(r3).toBe(e1);
    });

    it('should reuse the elements when removing and adding data at the beginning and the end', async () => {
        const elm = createElement('c-table', { is: Table });
        elm.rows = [{ id: 0 }, { id: 1 }, { id: 2 }];
        document.body.appendChild(elm);

        const [, e2, e3] = elm.shadowRoot.querySelectorAll('c-row');
        elm.rows = [{ id: 2 }, { id: 1 }, { id: 3 }];

        await Promise.resolve();
        expect(elm.shadowRoot.querySelectorAll('c-row').length).toBe(3);
        const [r1, r2] = elm.shadowRoot.querySelectorAll('c-row');
        expect(r1).toBe(e3);
        expect(r2).toBe(e2);
    });

    it('should reuse the elements when moving the end to the start and adding new to the end', async () => {
        const elm = createElement('c-table', { is: Table });
        elm.rows = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];
        document.body.appendChild(elm);

        const getRowContents = () => {
            return [...elm.shadowRoot.querySelectorAll('c-row')].map((row) =>
                parseInt(row.shadowRoot.querySelector('span').textContent, 10)
            );
        };

        const [, e2, e3, e4] = elm.shadowRoot.querySelectorAll('c-row');
        expect(getRowContents()).toEqual([0, 1, 2, 3]);
        elm.rows = [{ id: 3 }, { id: 1 }, { id: 2 }, { id: 4 }];

        await Promise.resolve();
        expect(getRowContents()).toEqual([3, 1, 2, 4]);
        expect(elm.shadowRoot.querySelectorAll('c-row').length).toBe(4);
        const [r1, r2, r3] = elm.shadowRoot.querySelectorAll('c-row');
        expect(r2).toBe(e2);
        expect(r3).toBe(e3);
        expect(r1).toBe(e4);
    });

    it('sorting a table', async () => {
        const elm = createElement('c-table', { is: Table });
        const ids = [0, 9, 1, 5, 2, 3, 8, 4, 6, 7];
        elm.rows = ids.map((id) => ({ id }));
        document.body.appendChild(elm);

        const getRowContents = () => {
            return [...elm.shadowRoot.querySelectorAll('c-row')].map((row) =>
                parseInt(row.shadowRoot.querySelector('span').textContent, 10)
            );
        };
        expect(getRowContents()).toEqual(ids);

        const sortedIds = ids.sort((a, b) => a - b);

        elm.rows = sortedIds.map((id) => ({ id }));

        await Promise.resolve();
        expect(getRowContents()).toEqual(sortedIds);
    });
});
