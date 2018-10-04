export const CompilerErrors = {
  TRANSFORM_EXPECTED_STRING: {
    code: 1001,
    message: "Expect a string for {0}. Received {1}",
    category: "Error",
  },
  TRANSFORM_NO_AVAILABLE_TRANSFORMER: {
      code: 1002,
      message: "No available transformer for \"{0}\"",
      category: "Error",
      type: "TypeError"
  }
};
