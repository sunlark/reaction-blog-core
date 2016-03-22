import { ReactionCore } from "meteor/reactioncommerce:core";

ReactionCore.registerPackage({
  label: "Blog",
  name: "reaction-blog-core",
  icon: "fa fa-book",
  autoEnable: true,
  /*settings: {
    
  },*/
  registry: [{
    provides: "dashboard",
    // template: "commentsDashboard",
    label: "Blog",
    description: "Server part of blog functionality", // todo
    icon: "fa fa-blog",
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
