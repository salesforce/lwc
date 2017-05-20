export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.bar || undefined;

    return [$api.h(
        "section",
        {},
        [$api.h(
            "p",
            {},
            ["1"]
        ), _expr && $api.h(
            "p",
            {},
            ["2"]
        ), $api.h(
            "p",
            {},
            ["3"]
        )]
    )];
}
tmpl.ids = ["bar"];
