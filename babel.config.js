// babel-preset-expo already wires up Expo Router and, when react-native-reanimated
// is installed, the worklets plugin. Keep this file minimal.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
