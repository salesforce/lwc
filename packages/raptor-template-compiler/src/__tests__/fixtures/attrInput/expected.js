export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "input",
        {
            attrs: {
                type: "checkbox"
            },
            props: {
                checked: true
            }
        },
        []
    )];
}
