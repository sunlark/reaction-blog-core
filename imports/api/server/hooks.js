import { ReactionCore } from "meteor/reactioncommerce:core";
import { deleteMedia } from "../methods";

ReactionCore.MethodHooks.after("blog.deletePosts", function (options) {
  if (options.error) {
    ReactionCore.Log.warn("Error while removing posts", options.error.reason);
    return options.error;
  }
  if (options.result > 0) {
    // remove media of posts if we got results
    deleteMedia.call({ postIds: options.arguments[0].postIds });
    return options.result;
  }
  ReactionCore.Log.warn("Something went wrong while posts removing, nothing was deleted");
  throw new Meteor.Error("blog.posts.deletePosts.nothing-was-deleted",
    "Something went wrong, nothing was deleted");
});
