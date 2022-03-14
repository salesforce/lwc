import { load as _load } from "@custom/loader";
export async function test() {
  const x = await _load("foo");
  return x + "yay";
}