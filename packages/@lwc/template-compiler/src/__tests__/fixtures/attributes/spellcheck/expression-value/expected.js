import _xFoo from "x/foo";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
    const { c: api_custom_element, h: api_element } = $api;
    return [
        api_custom_element(
            "x-foo",
            _xFoo,
            {
                props: {
                    spellcheck:
                        $cmp.spellcheckGetter != null
                            ? $cmp.spellcheckGetter.toString().toLowerCase() !== "false"
                            : true
                },
                key: 0
            },
            []
        ),
        api_element(
            "textarea",
            {
                attrs: {
                    spellcheck: $cmp.spellcheckGetter
                },
                key: 1
            },
            []
        )
    ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
