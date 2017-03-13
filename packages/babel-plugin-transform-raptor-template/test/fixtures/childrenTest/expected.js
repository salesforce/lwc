const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const _expr = $cmp.isTrue || $api.e();

    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {
            classMap: {
                s1: true
            }
        },
        $api.f(["Other Child", $api.i($cmp.items, function (item) {
            return "X";
        })])
    ), $api.h(
        "section",
        {
            classMap: {
                s2: true
            }
        },
        $api.f(["Other Child", _expr && $api.i(
            $cmp.items,
            function (item) {
                return [$api.h(
                    "p",
                    {},
                    ["X1"]
                ), $api.h(
                    "p",
                    {},
                    ["X2"]
                )];
            }
        )])
    ), $api.h(
        "section",
        {
            classMap: {
                s3: true
            }
        },
        $api.f(["Other child", $api.i($cmp.items, function (item) {
            return $api.h(
                "div",
                {},
                []
            );
        })])
    )];
}
export const templateUsedIds = ["items", "isTrue"];
