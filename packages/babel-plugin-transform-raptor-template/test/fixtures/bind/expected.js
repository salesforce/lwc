import _ns$foo from "ns:foo";

const _m = function ($api, $cmp) {
    return $cmp.p.foo.bind($cmp);
};

const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        null,
        [$api.v(
            _ns$foo,
            {
                attrs: {
                    d: m._m || (m._m = _m($api, $cmp))
                }
            },
            []
        )]
    )];
}
export const templateUsedIds = [];
