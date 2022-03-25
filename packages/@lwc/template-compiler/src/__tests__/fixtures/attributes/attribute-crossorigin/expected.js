import { registerTemplate, renderApi } from "lwc";
const { h: api_element, so: api_set_owner } = renderApi;
const $hoisted1 = api_element(
  "img",
  {
    attrs: {
      src: "http://www.example.com/image.png",
      crossorigin: "anonymous",
    },
    key: 0,
  },
  [],
  true
);
const $hoisted2 = api_element(
  "video",
  {
    attrs: {
      src: "http://www.example.com/video.mp4",
      crossorigin: "anonymous",
    },
    key: 1,
  },
  [],
  true
);
const $hoisted3 = api_element(
  "audio",
  {
    attrs: {
      src: "http://www.example.com/video.mp3",
      crossorigin: "anonymous",
    },
    key: 2,
  },
  [],
  true
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_set_owner($hoisted1),
    api_set_owner($hoisted2),
    api_set_owner($hoisted3),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
