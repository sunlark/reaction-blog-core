import { Mongo } from "meteor/mongo";
// import { ReactionCore } from "meteor/reactioncommerce:core";
import PostSchema from "./schema";

const Posts = new Mongo.Collection("Posts");
Posts.attachSchema(PostSchema);

// Deny all client-side updates since we will be using methods to manage
// this collection
Posts.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

export default Posts;
