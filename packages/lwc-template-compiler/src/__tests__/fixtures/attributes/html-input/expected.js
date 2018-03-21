export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element } = $api;

    return [
        api_element(
            'input',
            {
                props: {
                    type: 'checkbox',
                    required: true,
                    readOnly: true,
                    checked: true,
                    minLength: '5',
                    maxLength: '10'
                },
                key: 1
            },
            []
        )
    ];
}
