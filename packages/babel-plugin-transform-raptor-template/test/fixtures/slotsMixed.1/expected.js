import _xB from "x-b";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isLoading || undefined,
          _expr2 = $cmp.haveLoadedItems || undefined;

    return [$api.h(
        "div",
        {},
        [$api.c(
            "x-b",
            _xB,
            {
                slotset: {
                    $default$: $api.f([_expr ? $api.h(
                        "div",
                        {},
                        []
                    ) : null, _expr2 && $api.i(
                        $cmp.menuItems,
                        function (item) {
                            return $api.t("x");
                        }
                    )])
                }
            }
        )]
    )];
}
tmpl.ids = ["isLoading", "haveLoadedItems", "menuItems"];
