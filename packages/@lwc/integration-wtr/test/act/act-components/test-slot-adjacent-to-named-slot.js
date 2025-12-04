/* eslint-disable */
export default function (define) {
    return define(
        'records/recordLayout2',
        ['force/foo', 'ui/another', 'ui/something', 'lwc'],
        function (_forceFoo, _uiAnother, _uiSomething, lwc) {
            function _interopDefaultLegacy(e) {
                return e && typeof e === 'object' && 'default' in e ? e : { default: e };
            }
            var _forceFoo__default = /*#__PURE__*/ _interopDefaultLegacy(_forceFoo);
            var _uiAnother__default = /*#__PURE__*/ _interopDefaultLegacy(_uiAnother);
            var _uiSomething__default = /*#__PURE__*/ _interopDefaultLegacy(_uiSomething);
            function tmpl($api, $cmp, $slotset, $ctx) {
                const { c: api_custom_element, s: api_slot } = $api;
                return [
                    api_custom_element(
                        'force-foo',
                        _forceFoo__default['default'],
                        {
                            props: {
                                name: 'Elizabeth Shaw',
                            },
                            key: 1,
                        },
                        [
                            api_custom_element(
                                'ui-another',
                                _uiAnother__default['default'],
                                {
                                    slotAssignment: 'adjacent',
                                    props: {
                                        value: 'Foo',
                                    },
                                    key: 2,
                                },
                                []
                            ),
                            api_custom_element(
                                'ui-another',
                                _uiAnother__default['default'],
                                {
                                    props: {
                                        value: 'Foo',
                                    },
                                    key: 3,
                                },
                                []
                            ),
                            api_slot(
                                '',
                                {
                                    key: 4,
                                },
                                [
                                    api_custom_element(
                                        'ui-something',
                                        _uiSomething__default['default'],
                                        {
                                            key: 5,
                                        },
                                        []
                                    ),
                                ],
                                $slotset
                            ),
                        ]
                    ),
                ];
            }

            lwc.registerTemplate(tmpl);
            tmpl.slots = [''];
            tmpl.stylesheets = [];
            tmpl.stylesheetToken = 'records-recordLayout2_recordLayout2';
            lwc.freezeTemplate(tmpl);
            return tmpl;
        }
    );
}
