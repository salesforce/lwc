export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element('p', {
            props: {
                hidden: true
            },
            key: 1
        },
        [
            api_text('x')
        ]),
        api_element('input', {
            attrs: {
                title: 'foo'
            },
            props: {
                readOnly: $cmp.getReadOnly,
                disabled: true,
            },
            key: 2
        },
        [

        ])
    ];
}
