export async function test() {
  const x = await import("foo");
  return x + "yay";
}
