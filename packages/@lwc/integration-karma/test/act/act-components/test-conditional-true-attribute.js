/* eslint-disable */
export default function (define) {
    return define('records/recordLayout2', ['ui/boolean', 'lwc'], function (_uiBoolean, lwc) {
        function _interopDefaultLegacy(e) {
            return e && typeof e === 'object' && 'default' in e ? e : { default: e };
        }
        var _uiBoolean__default = /*#__PURE__*/ _interopDefaultLegacy(_uiBoolean);
        function tmpl($api, $cmp, $slotset, $ctx) {
            const { c: api_custom_element } = $api;
            return [
                $cmp.state.irrelevant
                    ? api_custom_element(
                          'ui-boolean',
                          _uiBoolean__default['default'],
                          {
                              props: {
                                  other: 'irrelevant',
                              },
                              key: 1,
                          },
                          []
                      )
                    : null,
            ];
        }

        lwc.registerTemplate(tmpl);
        tmpl.stylesheets = [];
        tmpl.stylesheetToken = 'records-recordLayout2_recordLayout2';
        lwc.freezeTemplate(tmpl);
        return tmpl;
    });
}
