import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        styleMap: {
          color: "blue"
        },
        key: 1
      },
      []
    ),
    api_element(
      "div",
      {
        styleMap: {
          color: "blue"
        },
        key: 2
      },
      []
    ),
    api_element(
      "div",
      {
        styleMap: {
          color: "blue"
        },
        key: 3
      },
      []
    ),
    api_element(
      "div",
      {
        styleMap: {
          boxShadow: "10px 5px 5px black"
        },
        key: 4
      },
      []
    ),
    api_element(
      "div",
      {
        styleMap: {
          fontSize: "12px",
          background: "blue",
          color: "red"
        },
        key: 5
      },
      []
    ),
    api_element(
      "div",
      {
        styleMap: {
          fontSize: "12px",
          background: "blue",
          color: "red"
        },
        key: 6
      },
      []
    ),
    api_element(
      "div",
      {
        styleMap: {
          backgroundColor: "rgba(255,0,0,0.3)"
        },
        key: 7
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
