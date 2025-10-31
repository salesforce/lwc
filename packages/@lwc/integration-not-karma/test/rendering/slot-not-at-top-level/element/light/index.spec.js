import { createElement } from 'lwc';
import Outer from 'c/outer';
import {
    USE_LIGHT_DOM_SLOT_FORWARDING,
    USE_COMMENTS_FOR_FRAGMENT_BOOKENDS,
} from '../../../../../helpers/constants.js';
import { expectEquivalentDOM } from '../../../../../helpers/utils.js';

// `expectEquivalentDOM` requires `Document.parseHTMLUnsafe`
it.runIf(Document.parseHTMLUnsafe)('renders slots not at the top level', async () => {
    const elm = createElement('c-outer', { is: Outer });
    document.body.appendChild(elm);

    await Promise.resolve();

    let expected;
    if (USE_LIGHT_DOM_SLOT_FORWARDING) {
        expected = `<c-outer><c-inner>a<!----><div><div slot="foo">I am the foo slot</div></div><div><div slot="foo">I am also the foo slot</div></div><!---->b<!---->fallback for foo<!---->c</c-inner></c-outer>`;
    } else if (USE_COMMENTS_FOR_FRAGMENT_BOOKENDS) {
        expected = `<c-outer><c-inner>a<!----><div><div slot="foo">I am the foo slot</div></div><div><div slot="foo">I am also the foo slot</div></div><!---->b<!---->fallback for foo<!---->c</c-inner></c-outer>`;
    } else {
        expected = `<c-outer><c-inner>a<div><div slot="foo">I am the foo slot</div></div><div><div slot="foo">I am also the foo slot</div></div>bfallback for fooc</c-inner></c-outer>`;
    }

    expectEquivalentDOM(elm, expected);
});
