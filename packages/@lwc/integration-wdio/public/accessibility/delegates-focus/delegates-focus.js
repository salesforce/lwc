(function (lwc) {
    'use strict';

    const $fragment1 = lwc.parseFragment`<input type="text"${3}>`;
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1, 1)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-4l2u0hktfsh";
    tmpl.legacyStylesheetToken = "integration-delegates-focus_delegates-focus";
    lwc.freezeTemplate(tmpl);

    class DelegatesFocus extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    DelegatesFocus.delegatesFocus = true;
    const __lwc_component_class_internal = lwc.registerComponent(DelegatesFocus, {
      tmpl: _tmpl,
      sel: "integration-delegates-focus",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-delegates-focus', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
