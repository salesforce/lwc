export async function test() {
  const id = "foo";
  const x = await import(id);
  return x + "yay";
}
