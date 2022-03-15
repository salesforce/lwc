export async function test() {
  const x = await import("foo");
  const y = await import("bar");
  return x + y + "yay";
}
