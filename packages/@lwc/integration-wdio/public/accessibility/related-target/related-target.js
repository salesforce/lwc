(function (lwc) {
    'use strict';

    const $fragment1$2 = lwc.parseFragment`<h1${3}>child</h1>`;
    const $fragment2$2 = lwc.parseFragment`<li${3}>${"t1"}</li>`;
    const $fragment3$2 = lwc.parseFragment`<input placeholder="child"${3}>`;
    const stc0$2 = {
      key: 2
    };
    function tmpl$2($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, k: api_key, d: api_dynamic_text, sp: api_static_part, i: api_iterator, h: api_element, b: api_bind} = $api;
      const {_m0, _m1} = $ctx;
      return [api_static_fragment($fragment1$2, 1), api_element("ol", stc0$2, api_iterator($cmp.formattedEvents, function (event) {
        return api_static_fragment($fragment2$2, api_key(4, event), [api_static_part(1, null, api_dynamic_text(event))]);
      })), api_static_fragment($fragment3$2, 6, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "focus": api_bind($cmp.handleFocusOrBlur),
          "blur": api_bind($cmp.handleFocusOrBlur)
        })
      }, null)])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$2 = lwc.registerTemplate(tmpl$2);
    tmpl$2.stylesheets = [];
    tmpl$2.stylesheetToken = "lwc-74484v40a3r";
    tmpl$2.legacyStylesheetToken = "integration-child_child";
    lwc.freezeTemplate(tmpl$2);

    class Child extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.events = [];
      }
      getEvents() {
        return this.events;
      }
      handleFocusOrBlur(event) {
        const {
          type,
          relatedTarget
        } = event;
        this.events.push({
          type,
          relatedTarget: relatedTarget ? relatedTarget.tagName : 'NULL'
        });
      }
      get formattedEvents() {
        return this.events.map(JSON.stringify);
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(Child, {
      publicMethods: ["getEvents"],
      track: {
        events: 1
      }
    });
    const __lwc_component_class_internal$2 = lwc.registerComponent(Child, {
      tmpl: _tmpl$2,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1$1 = lwc.parseFragment`<h1${3}>parent</h1>`;
    const $fragment2$1 = lwc.parseFragment`<li${3}>${"t1"}</li>`;
    const $fragment3$1 = lwc.parseFragment`<input placeholder="parent"${3}>`;
    const stc0$1 = {
      key: 2
    };
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, k: api_key, d: api_dynamic_text, sp: api_static_part, i: api_iterator, h: api_element, b: api_bind, c: api_custom_element} = $api;
      const {_m0, _m1, _m2} = $ctx;
      return [api_static_fragment($fragment1$1, 1), api_element("ol", stc0$1, api_iterator($cmp.formattedEvents, function (event) {
        return api_static_fragment($fragment2$1, api_key(4, event), [api_static_part(1, null, api_dynamic_text(event))]);
      })), api_static_fragment($fragment3$1, 6, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "focus": api_bind($cmp.handleFocusOrBlur),
          "blur": api_bind($cmp.handleFocusOrBlur)
        })
      }, null)]), api_custom_element("integration-child", __lwc_component_class_internal$2, {
        key: 7,
        on: _m2 || ($ctx._m2 = {
          "focus": api_bind($cmp.handleFocusOrBlur),
          "blur": api_bind($cmp.handleFocusOrBlur)
        })
      })];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-5etg9jssjsj";
    tmpl$1.legacyStylesheetToken = "integration-parent_parent";
    lwc.freezeTemplate(tmpl$1);

    class Parent extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.events = [];
      }
      getEvents() {
        return this.events;
      }
      handleFocusOrBlur(event) {
        const {
          type,
          relatedTarget
        } = event;
        this.events.push({
          type,
          relatedTarget: relatedTarget ? relatedTarget.tagName : 'NULL'
        });
      }
      get formattedEvents() {
        return this.events.map(JSON.stringify);
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(Parent, {
      publicMethods: ["getEvents"],
      track: {
        events: 1
      }
    });
    const __lwc_component_class_internal$1 = lwc.registerComponent(Parent, {
      tmpl: _tmpl$1,
      sel: "integration-parent",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<h1${3}>container</h1>`;
    const $fragment2 = lwc.parseFragment`<li${3}>${"t1"}</li>`;
    const $fragment3 = lwc.parseFragment`<input placeholder="container"${3}>`;
    const stc0 = {
      key: 2
    };
    const stc1 = {
      key: 7
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, k: api_key, d: api_dynamic_text, sp: api_static_part, i: api_iterator, h: api_element, b: api_bind, c: api_custom_element} = $api;
      const {_m0, _m1} = $ctx;
      return [api_static_fragment($fragment1, 1), api_element("ol", stc0, api_iterator($cmp.formattedEvents, function (event) {
        return api_static_fragment($fragment2, api_key(4, event), [api_static_part(1, null, api_dynamic_text(event))]);
      })), api_static_fragment($fragment3, 6, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "focus": api_bind($cmp.handleFocusOrBlur),
          "blur": api_bind($cmp.handleFocusOrBlur)
        })
      }, null)]), api_custom_element("integration-parent", __lwc_component_class_internal$1, stc1)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-6c3oqnbkoat";
    tmpl.legacyStylesheetToken = "integration-related-target_related-target";
    lwc.freezeTemplate(tmpl);

    class Container extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.events = [];
      }
      getEvents() {
        return this.events;
      }
      handleFocusOrBlur(event) {
        const {
          type,
          relatedTarget
        } = event;
        this.events.push({
          type,
          relatedTarget: relatedTarget ? relatedTarget.tagName : 'NULL'
        });
      }
      get formattedEvents() {
        return this.events.map(JSON.stringify);
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(Container, {
      publicMethods: ["getEvents"],
      track: {
        events: 1
      }
    });
    const __lwc_component_class_internal = lwc.registerComponent(Container, {
      tmpl: _tmpl,
      sel: "integration-related-target",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-related-target', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
