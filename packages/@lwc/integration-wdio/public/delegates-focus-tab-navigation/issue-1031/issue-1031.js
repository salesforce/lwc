(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<button class="child-inside${0}"${2}>child inside</button>`;
    function tmpl$2($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$1, 1)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$2 = lwc.registerTemplate(tmpl$2);
    tmpl$2.stylesheets = [];
    tmpl$2.stylesheetToken = "lwc-74484v40a3r";
    tmpl$2.legacyStylesheetToken = "integration-child_child";
    lwc.freezeTemplate(tmpl$2);

    class Child extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    Child.delegatesFocus = true;
    const __lwc_component_class_internal$2 = lwc.registerComponent(Child, {
      tmpl: _tmpl$2,
      sel: "integration-child",
      apiVersion: 66
    });

    const stc0$1 = {
      key: 0
    };
    const stc1 = {
      props: {
        "tabIndex": "-1"
      },
      key: 1
    };
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {c: api_custom_element, h: api_element} = $api;
      return [api_element("div", stc0$1, [api_custom_element("integration-child", __lwc_component_class_internal$2, stc1)])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-5etg9jssjsj";
    tmpl$1.legacyStylesheetToken = "integration-parent_parent";
    lwc.freezeTemplate(tmpl$1);

    class Parent extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    const __lwc_component_class_internal$1 = lwc.registerComponent(Parent, {
      tmpl: _tmpl$1,
      sel: "integration-parent",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<div${3}><button class="initialize${0}"${2}>initialize tabindex to 0</button></div>`;
    const $fragment2 = lwc.parseFragment`<input class="first-outside${0}" placeholder="first (outside)"${2}>`;
    const $fragment3 = lwc.parseFragment`<input class="second-outside${0}" placeholder="second (outside)"${2}>`;
    const stc0 = {
      key: 4
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, sp: api_static_part, st: api_static_fragment, ti: api_tab_index, c: api_custom_element, h: api_element} = $api;
      const {_m0, _m1} = $ctx;
      return [api_static_fragment($fragment1, 1, [api_static_part(1, {
        on: _m0 || ($ctx._m0 = {
          "click": api_bind($cmp.handleClick)
        })
      }, null)]), api_static_fragment($fragment2, 3), api_element("div", stc0, [api_custom_element("integration-parent", __lwc_component_class_internal$1, {
        props: {
          "tabIndex": api_tab_index($cmp.computedTabIndex)
        },
        key: 5,
        on: _m1 || ($ctx._m1 = {
          "focusout": api_bind($cmp.handleFocusOut)
        })
      })]), api_static_fragment($fragment3, 7)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-4flusb8s2dv";
    tmpl.legacyStylesheetToken = "integration-issue-1031_issue-1031";
    lwc.freezeTemplate(tmpl);

    class Container extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.computedTabIndex = 0;
      }
      handleClick() {
        this.computedTabIndex = 0;
      }
      handleFocusOut() {
        // Changes the tabindex in the middle of delegatesFocus simulation!
        this.computedTabIndex = -1;
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(Container, {
      track: {
        computedTabIndex: 1
      }
    });
    const __lwc_component_class_internal = lwc.registerComponent(Container, {
      tmpl: _tmpl,
      sel: "integration-issue-1031",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-issue-1031', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
