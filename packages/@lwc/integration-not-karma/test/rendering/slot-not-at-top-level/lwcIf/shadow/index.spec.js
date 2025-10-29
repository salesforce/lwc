import { createElement } from 'lwc';
import Outer from 'c/outer';
import { expectEquivalentDOM } from '../../../../../helpers/utils.js';

// `expectEquivalentDOM` requires `Document.parseHTMLUnsafe`
it.runIf(Document.parseHTMLUnsafe)('renders slots not at the top level', async () => {
    const elm = createElement('c-outer', { is: Outer });
    document.body.appendChild(elm);

    await Promise.resolve();

    let expected;
    if (process.env.NATIVE_SHADOW) {
        expected =
            '<c-outer><template shadowrootmode="open"><c-inner><template shadowrootmode="open">a<slot>fallback for default</slot>b<slot name="foo">fallback for foo</slot>c</template><div slot="foo">I am the foo slot</div><div slot="foo">I am also the foo slot</div></c-inner></template></c-outer>';
    } else {
        // synthetic shadow does not render the fallback for the foo slot
        expected =
            '<c-outer><template shadowrootmode="open"><c-inner><template shadowrootmode="open">a<slot>fallback for default</slot>b<slot name="foo"></slot>c</template><div slot="foo">I am the foo slot</div><div slot="foo">I am also the foo slot</div></c-inner></template></c-outer>';
    }

    expectEquivalentDOM(elm, expected);
});
