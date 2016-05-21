import { ReactionCore } from "meteor/reactioncommerce:core";

ReactionCore.registerPackage({
  label: "Blog",
  name: "reaction-blog-core",
  icon: "fa fa-book",
  autoEnable: true,
  registry: [{
    provides: "dashboard",
    // template: "commentsDashboard",
    label: "Blog",
    description: "Server part to manage posts",
    icon: "fa fa-book",
    priority: 2,
    container: "utilities",
    permissions: [{
      label: "Blog",
      permission: "manageBlog"
    }]
  }, {
    label: "Blog Settings",
    route: "/dashboard/blog/settings",
    provides: "settings",
    container: "dashboard",
    template: "blogSettings"
  }]
});
