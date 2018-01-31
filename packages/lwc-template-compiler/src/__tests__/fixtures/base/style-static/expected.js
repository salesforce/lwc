export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element } = $api;

    return [
        api_element(
            'section',
            {
                styleMap: {
                    fontSize: '12px',
                    color: 'red',
                    marginLeft: '5px',
                    marginRight: '5px',
                    marginTop: '10px',
                    marginBottom: '10px'
                },
                ck: 1
            },
            []
        )
    ];
}
