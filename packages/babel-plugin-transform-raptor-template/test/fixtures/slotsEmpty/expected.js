import _xCmp from "x-cmp";
const memoized = Symbol('memoize');
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.c(
        "x-cmp",
        _xCmp,
        {}
    )];
}
export const templateUsedIds = [];
