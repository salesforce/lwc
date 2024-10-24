import { createElement } from 'lwc';
import { expectEquivalentDOM, USE_COMMENTS_FOR_FRAGMENT_BOOKENDS } from 'test-utils';
import Outer from 'x/outer';

beforeAll(() => {
    customElements.define('x-external-light', class extends HTMLElement {});
});

// `expectEquivalentDOM` requires `Document.parseHTMLUnsafe`
// USE_COMMENTS_FOR_FRAGMENT_BOOKENDS is needed because otherwise we end up with adjacent text nodes which parse as one
it.runIf(Document.parseHTMLUnsafe && USE_COMMENTS_FOR_FRAGMENT_BOOKENDS)(
    'renders slots not at the top level',
    async () => {
        const elm = createElement('x-outer', { is: Outer });
        document.body.appendChild(elm);

        await Promise.resolve();

        expectEquivalentDOM(
            elm,
            `<x-outer><x-inner>a<!----><x-external-light><div slot="foo">I am the foo slot</div></x-external-light><x-external-light><div slot="foo">I am also the foo slot</div></x-external-light><!---->b<!---->fallback for foo<!---->c</x-inner></x-outer>`
        );
    }
);
