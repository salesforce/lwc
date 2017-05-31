import _xFoo from "x-foo";
export default function tmpl($api, $cmp, $slotset, $ctx) {
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
