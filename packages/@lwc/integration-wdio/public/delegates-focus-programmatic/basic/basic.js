(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<input class="internal-input${0}" placeholder="internal"${2}>`;
    const $fragment2 = lwc.parseFragment`<textarea class="internal-textarea${0}" placeholder="internal"${2}></textarea>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$1, 1), api_static_fragment($fragment2, 3)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-74484v40a3r";
    tmpl$1.legacyStylesheetToken = "integration-child_child";
    lwc.freezeTemplate(tmpl$1);

    class Child extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    Child.delegatesFocus = true;
    const __lwc_component_class_internal$1 = lwc.registerComponent(Child, {
      tmpl: _tmpl$1,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<button${3}>focus</button>`;
    const stc0 = {
      props: {
        "tabIndex": "0"
      },
      key: 2
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, sp: api_static_part, st: api_static_fragment, c: api_custom_element} = $api;
      const {_m0, _m1} = $ctx;
      return [api_static_fragment($fragment1, 1, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "click": api_bind($cmp.handleClick)
        })
      }, null)]), api_custom_element("integration-child", __lwc_component_class_internal$1, stc0)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-5uk3gm1rk7n";
    tmpl.legacyStylesheetToken = "integration-basic_basic";
    lwc.freezeTemplate(tmpl);

    class Container extends lwc.LightningElement {
      handleClick() {
        this.template.querySelector('integration-child').focus();
      }
      /*LWC compiler v8.24.0*/
    }
    const __lwc_component_class_internal = lwc.registerComponent(Container, {
      tmpl: _tmpl,
      sel: "integration-basic",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-basic', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
