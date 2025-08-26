import { createElement } from 'lwc';
import { expectEquivalentDOM } from 'test-utils';
import Outer from 'x/outer';

beforeAll(() => {
    customElements.define('x-external-shadow', class extends HTMLElement {});
});

// `expectEquivalentDOM` requires `Document.parseHTMLUnsafe`
it.runIf(Document.parseHTMLUnsafe)('renders slots not at the top level', async () => {
    const elm = createElement('x-outer', { is: Outer });
    document.body.appendChild(elm);

    await Promise.resolve();

    let expected;
    if (process.env.NATIVE_SHADOW) {
        expected =
            '<x-outer><template shadowrootmode="open"><x-inner><template shadowrootmode="open">a<slot>fallback for default</slot>b<slot name="foo">fallback for foo</slot>c</template><x-external-shadow><div slot="foo">I am the foo slot</div></x-external-shadow><x-external-shadow><div slot="foo">I am also the foo slot</div></x-external-shadow></x-inner></template></x-outer>';
    } else {
        // synthetic shadow does not render the fallback for the default slot
        expected =
            '<x-outer><template shadowrootmode="open"><x-inner><template shadowrootmode="open">a<slot></slot>b<slot name="foo">fallback for foo</slot>c</template><x-external-shadow><div slot="foo">I am the foo slot</div></x-external-shadow><x-external-shadow><div slot="foo">I am also the foo slot</div></x-external-shadow></x-inner></template></x-outer>';
    }

    expectEquivalentDOM(elm, expected);
});
