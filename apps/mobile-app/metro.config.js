const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// If you are using TypeScript, make sure to include ts/tsx extensions
config.resolver.sourceExts.push('ts', 'tsx');

// Add path alias support
config.resolver.alias = {
  '@': path.resolve(__dirname, '.'),
};

module.exports = config;
