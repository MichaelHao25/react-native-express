module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "import",
        {
          libraryName: "@ant-design/react-native",
        },
      ],
      // [
      //   "react-native-reanimated/plugin",
      //   {
      //     globals: ["__scanCodes"],
      //   },
      // ],
    ],
  };
};
