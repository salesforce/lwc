import _xCmp from "x-cmp";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.c(
        "x-cmp",
        _xCmp,
        {}
    )];
}
