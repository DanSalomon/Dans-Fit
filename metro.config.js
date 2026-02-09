const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Force react-native-svg to resolve from compiled commonjs output
    // instead of TypeScript source (fixes Metro resolution issue on Windows)
    resolverMainFields: ['main', 'browser'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
