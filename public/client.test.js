test("add 1 + 2 to euqal 3", () => {
  expect(sum(1, 2)).toBe(3)
})

function sum(a, b) {
  return a + b
}
