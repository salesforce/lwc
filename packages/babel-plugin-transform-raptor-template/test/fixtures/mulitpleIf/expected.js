const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const _expr = $cmp.isTrue || $api.e(),
          _expr2 = $cmp.isTrue || $api.e(),
          _expr3 = $cmp.isTrue || $api.e();

    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [_expr && $api.h(
        "p",
        {},
        ["1"]
    ), _expr2 && $api.h(
        "p",
        {},
        ["2"]
    ), _expr3 && $api.h(
        "p",
        {},
        ["3"]
    )];
}
export const templateUsedIds = ["isTrue"];
