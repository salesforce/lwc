import { createElement } from 'lwc';
import Table from 'x/table';
import { dataStatesVariant1, dataStatesVariant2 } from 'x/data';

// TODO [#4889]: fix issue with nested for:each loops and colliding keys
xdescribe('issue-4889 - should render for:each correctly when nested', () => {
    [dataStatesVariant1, dataStatesVariant2].forEach((dataStates, i) => {
        it(`variant ${i + 1}`, async () => {
            const elm = createElement('x-table', { is: Table });
            document.body.appendChild(elm);

            for (const dataState of dataStates) {
                await new Promise(setTimeout);
                elm.items = dataState;
            }
            // two ticks necessary to catch the unhandled rejection
            await new Promise(setTimeout);
            await new Promise(setTimeout);

            // whatever state the DOM is in now, it should be the same as if we rendered
            // the last data state from scratch
            const elm2 = createElement('x-table', { is: Table });
            elm2.items = dataStates[dataStates.length - 1];
            document.body.appendChild(elm2);

            await new Promise(setTimeout);

            const toKeys = (el) =>
                [...el.shadowRoot.children].map((_) => _.getAttribute('data-key'));

            expect(toKeys(elm)).toEqual(toKeys(elm2));
        });
    });
});
