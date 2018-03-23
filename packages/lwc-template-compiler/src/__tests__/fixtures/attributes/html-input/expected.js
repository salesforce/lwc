export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element } = $api;

    return [
        api_element(
            'input',
            {
                attrs: {
                    type: 'checkbox',
                    required: true,
                    readonly: true,
                    minlength: '5',
                    maxlength: '10'
                },
                props: {
                    checked: true
                },
                key: 1
            },
            []
        )
    ];
}
