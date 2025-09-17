import { createElement } from 'lwc';
import Outer from 'x/outer';
import {
    USE_LIGHT_DOM_SLOT_FORWARDING,
    USE_COMMENTS_FOR_FRAGMENT_BOOKENDS,
} from '../../../../../helpers/constants.js';
import { expectEquivalentDOM } from '../../../../../helpers/utils.js';

beforeAll(() => {
    customElements.define('x-external-light', class extends HTMLElement {});
});

// `expectEquivalentDOM` requires `Document.parseHTMLUnsafe`
it.runIf(Document.parseHTMLUnsafe)('renders slots not at the top level', async () => {
    const elm = createElement('x-outer', { is: Outer });
    document.body.appendChild(elm);

    await Promise.resolve();

    let expected;
    if (USE_LIGHT_DOM_SLOT_FORWARDING) {
        expected = `<x-outer><x-inner>a<!----><x-external-light><div slot="foo">I am the foo slot</div></x-external-light><x-external-light><div slot="foo">I am also the foo slot</div></x-external-light><!---->b<!---->fallback for foo<!---->c</x-inner></x-outer>`;
    } else if (USE_COMMENTS_FOR_FRAGMENT_BOOKENDS) {
        expected = `<x-outer><x-inner>a<!----><x-external-light><div slot="foo">I am the foo slot</div></x-external-light><x-external-light><div slot="foo">I am also the foo slot</div></x-external-light><!---->b<!---->fallback for foo<!---->c</x-inner></x-outer>`;
    } else {
        expected = `<x-outer><x-inner>a<x-external-light><div slot="foo">I am the foo slot</div></x-external-light><x-external-light><div slot="foo">I am also the foo slot</div></x-external-light>bfallback for fooc</x-inner></x-outer>`;
    }

    expectEquivalentDOM(elm, expected);
});
