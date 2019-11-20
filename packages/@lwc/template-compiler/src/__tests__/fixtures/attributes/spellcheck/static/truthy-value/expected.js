import _xFoo from "x/foo";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
    const { c: api_custom_element } = $api;
    return [
        api_custom_element(
            "x-foo",
            _xFoo,
            {
                props: {
                    spellcheck: true
                },
                key: 0
            },
            []
        ),
        api_custom_element(
            "x-foo",
            _xFoo,
            {
                props: {
                    spellcheck: true
                },
                key: 1
            },
            []
        ),
        api_custom_element(
            "x-foo",
            _xFoo,
            {
                props: {
                    spellcheck: true
                },
                key: 2
            },
            []
        )
    ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
