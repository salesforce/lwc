import { style, token } from './styles.css';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element(
            'p',
            {
                attrs: {
                    [token]: true,
                },
            },
            [api_text('Root')],
        ),
    ];
}
tmpl.style = style;
tmpl.token = token;
