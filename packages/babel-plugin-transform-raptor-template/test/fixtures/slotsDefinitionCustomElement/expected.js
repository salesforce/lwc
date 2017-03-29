import _xFoo from "x-foo";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
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
tmpl.slots = ["$default$"];
