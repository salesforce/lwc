import _xB from "x-b";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isLoading || $api.e(),
          _expr2 = $cmp.haveLoadedItems || $api.e();

    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "div",
        {},
        [$api.c(
            "x-b",
            _xB,
            {
                slotset: {
                    $default$: $api.f([_expr && $api.h(
                        "div",
                        {},
                        []
                    ), _expr2 && $api.i(
                        $cmp.menuItems,
                        function (item) {
                            return "x";
                        }
                    )])
                }
            }
        )]
    )];
}
tmpl.ids = ["isLoading", "haveLoadedItems", "menuItems"];
