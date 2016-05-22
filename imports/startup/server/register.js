import { ReactionCore } from "meteor/reactioncommerce:core";

ReactionCore.registerPackage({
  label: "Blog",
  name: "reaction-blog-core",
  icon: "fa fa-book",
  autoEnable: true,
  settings: {
    defaultTag: "blog"
  },
  registry: [{
    label: "Blog",
    name: "blog",
    description: "Server part to manage posts",
    icon: "fa fa-book",
    provides: "dashboard",
    priority: 2,
    container: "utilities",
    // template: "commentsDashboard",
    permissions: [{
      label: "Blog",
      permission: "manageBlog"
    }]
  }, {
    label: "Blog Settings",
    route: "/dashboard/blog/settings",
    // name: "blog/settings",
    provides: "settings",
    container: "dashboard",
    template: "blogSettings"
    // permissions: [{
    //   label: "Blog Settings",
    //   permission: "blogSettings"
    // }]
  }]
});
