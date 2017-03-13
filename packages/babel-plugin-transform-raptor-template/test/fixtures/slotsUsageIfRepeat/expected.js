import _aB from "a:b";
const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const _expr = $cmp.isTrue || $api.e();

    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.c(
        "a-b",
        _aB,
        {
            classMap: {
                s2: true
            },
            slotset: {
                $default$: _expr && $api.i(
                    $cmp.items,
                    function (item) {
                        return $api.h(
                            "p",
                            {},
                            ["X"]
                        );
                    }
                )
            }
        }
    )];
}
export const templateUsedIds = ["isTrue", "items"];
