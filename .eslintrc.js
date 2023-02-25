module.exports = {
  root: true,

  parserOptions: {
    sourceType: "module",
    parser: 'babel-eslint'
  },

  extends: [
    "plugin:vue/recommended", // Use this if you are using Vue.js 2.x.
  ],

  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-unused-expressions": "off",
  },
};
