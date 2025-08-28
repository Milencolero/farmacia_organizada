// jest.config.cjs
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.m?js$": "babel-jest"
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],


};
