/* eslint-disable */
export default function (define) {
    return define(
        'records/recordLayout2',
        ['nested/htmlTags', 'lwc'],
        function (_nestedHtmlTags, lwc) {
            function _interopDefaultLegacy(e) {
                return e && typeof e === 'object' && 'default' in e ? e : { default: e };
            }
            var _nestedHtmlTags__default = /*#__PURE__*/ _interopDefaultLegacy(_nestedHtmlTags);
            function tmpl($api, $cmp, $slotset, $ctx) {
                const { h: api_element, c: api_custom_element } = $api;
                return [
                    api_custom_element(
                        'nested-html-tags',
                        _nestedHtmlTags__default['default'],
                        {
                            key: 1,
                        },
                        [
                            api_element(
                                'div',
                                {
                                    key: 2,
                                },
                                [
                                    api_element(
                                        'div',
                                        {
                                            classMap: {
                                                inner: true,
                                            },
                                            key: 3,
                                        },
                                        [
                                            api_element(
                                                'div',
                                                {
                                                    key: 4,
                                                },
                                                []
                                            ),
                                            api_element(
                                                'h2',
                                                {
                                                    key: 5,
                                                },
                                                []
                                            ),
                                        ]
                                    ),
                                ]
                            ),
                        ]
                    ),
                ];
            }

            lwc.registerTemplate(tmpl);
            tmpl.stylesheets = [];
            tmpl.stylesheetToken = 'records-recordLayout2_recordLayout2';
            lwc.freezeTemplate(tmpl);
            return tmpl;
        }
    );
}
