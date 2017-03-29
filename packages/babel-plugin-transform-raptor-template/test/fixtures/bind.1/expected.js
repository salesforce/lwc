import _nsFoo from "ns-foo";

const _m = function ($api, $cmp) {
    return $cmp.myFooCallback.bind($cmp);
};

export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        [$api.c(
            "ns-foo",
            _nsFoo,
            {
                props: {
                    foo: m._m || (m._m = _m($api, $cmp))
                }
            }
        )]
    )];
}
tmpl.ids = ["myFooCallback"];
