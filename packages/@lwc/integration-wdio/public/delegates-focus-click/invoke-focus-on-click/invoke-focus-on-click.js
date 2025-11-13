(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<button${3}>click me</button>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, sp: api_static_part, st: api_static_fragment} = $api;
      const {_m0, _m1} = $ctx;
      return [api_static_fragment($fragment1$1, 1, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "focus": api_bind($cmp.handleFocus)
        })
      }, null)])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-74484v40a3r";
    tmpl$1.legacyStylesheetToken = "integration-child_child";
    lwc.freezeTemplate(tmpl$1);

    var _Class;
    const __lwc_component_class_internal$1 = lwc.registerComponent((_Class = class extends lwc.LightningElement {
      handleFocus(event) {
        event.target.focus();
      }
      /*LWC compiler v8.24.0*/
    }, _Class.delegatesFocus = true, _Class), {
      tmpl: _tmpl$1,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<input class="before${0}"${2}>`;
    const $fragment2 = lwc.parseFragment`<input class="after${0}"${2}>`;
    const stc0 = {
      props: {
        "tabIndex": "-1"
      },
      key: 2
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, c: api_custom_element} = $api;
      return [api_static_fragment($fragment1, 1), api_custom_element("integration-child", __lwc_component_class_internal$1, stc0), api_static_fragment($fragment2, 4)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-5k2iepjj6k2";
    tmpl.legacyStylesheetToken = "integration-invoke-focus-on-click_invoke-focus-on-click";
    lwc.freezeTemplate(tmpl);

    const __lwc_component_class_internal = lwc.registerComponent(class extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }, {
      tmpl: _tmpl,
      sel: "integration-invoke-focus-on-click",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-invoke-focus-on-click', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
