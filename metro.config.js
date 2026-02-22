const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add wasm asset support for expo-sqlite web
config.resolver.assetExts.push("wasm");

module.exports = withNativeWind(config, { input: "./src/global.css" });
