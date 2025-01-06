module.exports = {
  root: true,
  env: { es2020: true },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react-hooks/recommended"],
  ignorePatterns: [".serverless", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "@typescript-eslint/no-explicit-any": off,
  },
};
