const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const _expr = $cmp.isTrue || undefined;

    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [_expr && $api.f(
        ["Outer", $api.i($cmp.items, function (item) {
            return $api.h(
                "p",
                {},
                ["Inner"]
            );
        })]
    )];
}
export const templateUsedIds = ["isTrue", "items"];
