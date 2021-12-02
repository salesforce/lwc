import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    src: "http://www.example.com/image.png",
    crossorigin: "anonymous",
  },
  key: 0,
};
const stc1 = [];
const stc2 = {
  attrs: {
    src: "http://www.example.com/video.mp4",
    crossorigin: "anonymous",
  },
  key: 1,
};
const stc3 = {
  attrs: {
    src: "http://www.example.com/video.mp3",
    crossorigin: "anonymous",
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("img", stc0, stc1),
    api_element("video", stc2, stc1),
    api_element("audio", stc3, stc1),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
