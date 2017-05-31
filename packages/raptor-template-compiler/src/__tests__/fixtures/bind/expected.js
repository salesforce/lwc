import _nsFoo from "ns-foo";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        [$api.c(
            "ns-foo",
            _nsFoo,
            {
                on: {
                    foo: $ctx._m0 || ($ctx._m0 = $api.b($cmp.handleFoo))
                }
            }
        )]
    )];
}
