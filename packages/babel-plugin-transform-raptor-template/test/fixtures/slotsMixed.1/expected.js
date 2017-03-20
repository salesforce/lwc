import _xB from "x-b";
const memoized = Symbol('memoize');
export default function ($api, $cmp, $slotset) {
    const _expr = $cmp.isLoading || $api.e(),
          _expr2 = $cmp.haveLoadedItems || $api.e();

    const m = $cmp[memoized] || ($cmp[memoized] = {});
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
export const templateUsedIds = ["isLoading", "haveLoadedItems", "menuItems"];
