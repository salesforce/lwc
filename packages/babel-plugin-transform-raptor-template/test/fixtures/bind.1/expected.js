import _nsFoo from "ns:foo";

const _m = function ($api, $cmp) {
    return $cmp.myFooCallback.bind($cmp);
};

const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
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
export const templateUsedIds = ["myFooCallback"];
