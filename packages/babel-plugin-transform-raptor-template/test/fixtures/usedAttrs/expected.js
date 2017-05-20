export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        [$api.h(
            "p",
            {},
            [$cmp.obj.sub]
        )]
    )];
}
tmpl.ids = ["obj"];
