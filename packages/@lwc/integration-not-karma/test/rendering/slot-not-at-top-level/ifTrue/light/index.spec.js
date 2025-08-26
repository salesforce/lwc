import { createElement } from 'lwc';
import {
    expectEquivalentDOM,
    USE_LIGHT_DOM_SLOT_FORWARDING,
    USE_COMMENTS_FOR_FRAGMENT_BOOKENDS,
} from 'test-utils';
import Outer from 'x/outer';

// `expectEquivalentDOM` requires `Document.parseHTMLUnsafe`
it.runIf(Document.parseHTMLUnsafe)('renders slots not at the top level', async () => {
    const elm = createElement('x-outer', { is: Outer });
    document.body.appendChild(elm);

    await Promise.resolve();

    let expected;
    if (USE_LIGHT_DOM_SLOT_FORWARDING) {
        expected =
            '<x-outer><x-inner>a<!---->fallback for default<!---->b<!----><div>I am the foo slot</div><div>I am also the foo slot</div><!---->c</x-inner></x-outer>';
    } else if (USE_COMMENTS_FOR_FRAGMENT_BOOKENDS) {
        expected = `<x-outer><x-inner>a<!---->fallback for default<!---->b<!----><div slot="foo">I am the foo slot</div><div slot="foo">I am also the foo slot</div><!---->c</x-inner></x-outer>`;
    } else {
        expected =
            '<x-outer><x-inner>afallback for defaultb<div slot="foo">I am the foo slot</div><div slot="foo">I am also the foo slot</div>c</x-inner></x-outer>';
    }

    expectEquivalentDOM(elm, expected);
});
