const memoized = Symbol('memoize');
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
        }), $api.h(
            "p",
            {},
            ["Last child"]
        )])
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
        $api.f([$api.h(
            "p",
            {},
            ["Last child"]
        ), $api.i($cmp.items, function (item) {
            return $api.h(
                "div",
                {},
                []
            );
        })])
    ), $api.h(
        "section",
        {
            classMap: {
                s4: true
            }
        },
        [$api.h(
            "p",
            {},
            ["Other child1"]
        ), $api.h(
            "p",
            {},
            ["Other child2"]
        )]
    )];
}
export const templateUsedIds = ["items", "isTrue"];
