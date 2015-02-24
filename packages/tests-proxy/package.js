Package.describe({
	name: "velocity:test-proxy",
	summary: "Dynamically created package to expose test files to mirrors",
	version: "0.0.4",
	debugOnly: true
});

Package.onUse(function (api) {
	api.use("coffeescript", ["client", "server"]);
	api.add_files("tests/jasmine/server/integration/sample/spec/PlayerSpec.js",["server"]);
	api.add_files("tests/jasmine/server/integration/sample/spec/SpecMatchers.js",["server"]);
	api.add_files("tests/jasmine/server/integration/sample/src/Player.js",["server"]);
	api.add_files("tests/jasmine/server/integration/sample/src/Song.js",["server"]);
});