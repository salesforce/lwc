import { api, track } from "lwc";
export default class Test {
  @track
  @api
  apiWithTrack = "foo";
}
