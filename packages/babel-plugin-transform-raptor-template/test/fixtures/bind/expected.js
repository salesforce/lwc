import _ns$foo from "ns:foo";

const _m = function ($api, $cmp) {
    return $cmp.p.foo.bind($cmp);
};

const memoized = Symbol();
export default function ($api, $cmp) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        [$api.v(
            _ns$foo,
            {
                props: {
                    d: m._m || (m._m = _m($api, $cmp))
                }
            },
            []
        )]
    )];
}
export const templateUsedIds = [];
