Package.describe({
  name: "sunlark:reaction-blog-core",
  version: "0.0.1"
});

Npm.depends({
  // transliteration: "1.0.5"
});

Package.onUse(function (api) {
  api.versionsFrom("1.3.1");
  api.use("meteor-base");
  api.use("mongo");
  api.use("ecmascript");
  api.use("es5-shim");
  api.use("modules");
  api.use("ejson");
  api.use("logging");
  api.use("check");
  api.use("alanning:roles");
  api.use("aldeed:simple-schema");
  api.use("mdg:validated-method");
  api.use("random");
  api.use("ddp-rate-limiter");
  api.use("underscore");

  api.use("reactioncommerce:core@0.13.0");
  // api.use("reactioncommerce:reaction-schemas@2.0.5");
  api.use("ongoworks:transliteration@0.1.1");

  api.mainModule("client/main.js", "client");
  api.mainModule("server/main.js", "server");

  api.addAssets("private/data/i18n/en.json", "server");
  api.addAssets("private/data/i18n/ru.json", "server");
});

Package.onTest(function (api) {
  api.versionsFrom("METEOR@1.3.1");
  api.use("meteor-base");
  api.use("mongo");
  api.use("ecmascript");
  api.use("es5-shim");
  api.use("modules");
  api.use("logging");
  api.use("check");
  api.use("aldeed:simple-schema");
  api.use("mdg:validated-method");
//  api.use('avital:mocha@2.1.0_10');
  api.use("practicalmeteor:mocha@2.1.1-rc.1");
  api.use("sunlark:reaction-blog-core");
  api.use("reactioncommerce:reaction-factories@0.4.2");
  api.use("reactioncommerce:core@0.12.0");

  api.mainModule("client/main.js", "client");
  api.mainModule("server/main.js", "server");

  api.addFiles("imports/api/collections.tests.js");
  api.addFiles("imports/api/methods.tests.js");
});
