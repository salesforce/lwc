import _xB from "x-b";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "div",
        {},
        [$api.c(
            "x-b",
            _xB,
            {
                slotset: {
                    $default$: $api.f([$cmp.isLoading ? $api.h(
                        "div",
                        {},
                        []
                    ): null, $cmp.haveLoadedItems ? $api.i(
                        $cmp.menuItems,
                        function (item, index) {
                            return $api.t("x");
                        }
                    ) : []])
                }
            }
        )]
    )];
}
