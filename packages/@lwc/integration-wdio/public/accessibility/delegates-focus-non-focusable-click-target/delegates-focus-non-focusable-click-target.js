(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<label${"a0:for"}${3}>internal input</label>`;
    const $fragment2$1 = lwc.parseFragment`<input${"a0:id"} class="internal${0}" placeholder="internal"${2}>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {gid: api_scoped_id, sp: api_static_part, st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$1, 1, [api_static_part(0, {
        attrs: {
          "for": api_scoped_id("internal")
        }
      }, null)]), api_static_fragment($fragment2$1, 3, [api_static_part(0, {
        attrs: {
          "id": api_scoped_id("internal")
        }
      }, null)])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-4qhjp52bkua";
    tmpl$1.legacyStylesheetToken = "integration-input_input";
    lwc.freezeTemplate(tmpl$1);

    class FancyInput extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    FancyInput.delegatesFocus = true;
    const __lwc_component_class_internal$1 = lwc.registerComponent(FancyInput, {
      tmpl: _tmpl$1,
      sel: "integration-input",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<input placeholder="head" class="head${0}"${2}>`;
    const $fragment2 = lwc.parseFragment`<input placeholder="tail" class="tail${0}"${2}>`;
    const stc0 = {
      props: {
        "tabIndex": "-1"
      },
      key: 2
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, c: api_custom_element} = $api;
      return [api_static_fragment($fragment1, 1), api_custom_element("integration-input", __lwc_component_class_internal$1, stc0), api_static_fragment($fragment2, 4)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-54amhf3d4qb";
    tmpl.legacyStylesheetToken = "integration-delegates-focus-non-focusable-click-target_delegates-focus-non-focusable-click-target";
    lwc.freezeTemplate(tmpl);

    class DelegatesFocus extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    DelegatesFocus.delegatesFocus = true;
    const __lwc_component_class_internal = lwc.registerComponent(DelegatesFocus, {
      tmpl: _tmpl,
      sel: "integration-delegates-focus-non-focusable-click-target",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-delegates-focus-non-focusable-click-target', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
