import _xFoo from "x-foo";
const memoized = Symbol('memoize');
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.c(
        "x-foo",
        _xFoo,
        {
            slotset: {
                $default$: $slotset.$default$ || []
            }
        }
    )];
}
export const templateUsedIds = [];
