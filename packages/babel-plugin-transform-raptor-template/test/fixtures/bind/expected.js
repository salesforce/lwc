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
                    foo: $ctx._m || ($ctx._m = $api.b($cmp.handleFoo))
                }
            }
        )]
    )];
}
tmpl.ids = ["handleFoo"];
