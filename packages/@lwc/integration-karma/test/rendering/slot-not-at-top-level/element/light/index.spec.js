import { createElement } from 'lwc';
import { expectEquivalentDOM, USE_COMMENTS_FOR_FRAGMENT_BOOKENDS } from 'test-utils';
import Outer from 'x/outer';

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
            `<x-outer><x-inner>a<!----><div><div slot="foo">I am the foo slot</div></div><div><div slot="foo">I am also the foo slot</div></div><!---->b<!---->fallback for foo<!---->c</x-inner></x-outer>`
        );
    }
);
