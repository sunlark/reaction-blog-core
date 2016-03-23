import { Meteor, EJSON } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import Posts from "./collections.js";

const postValues = new SimpleSchema({
  title: {
    type: String,
    defaultValue: ""
  },
  pageTitle: {
    type: String,
    optional: true
  },
  keywords: {
    type: String,
    optional: true
  },
  metaDescription: {
    type: String,
    optional: true
  },
  annotation: {
    type: String,
    optional: true
  },
  body: {
    type: String
  },
  positions: {
    type: [ReactionCore.Schemas.ProductPosition],
    optional: true
  },
  isVisible: {
    type: Boolean,
    optional: true
  },
  isRecommended: {
    type: Boolean,
    optional: true
  },
  publishedAt: {
    type: Date,
    optional: true
  }
});

/**
 * addPost
 * @summary creates a post in blog
 * @type {ValidatedMethod}
 * @param {Object} values - post object
 * @returns {String} id of created post
 */
export const createPost = new ValidatedMethod({
  name: "addPost",
  validate: new SimpleSchema({
    values: { type: postValues }
  }).validator(),
  run({ values }) {
    // must have manageBlog permissions
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    return Posts.insert(values);
  }
});

/**
 * updatePostField
 * @summary update single post field
 * @type {ValidatedMethod}
 * @param {String} _id - post.id to update
 * @param {String} field - key to update
 * @param {*} value - update property value
 * @returns {Number} returns update result
 */
export const updatePostField = new ValidatedMethod({
  name: "updatePostField",
  validate: new SimpleSchema({
    _id: { type: String },
    field: { type: String },
    value: { type: Object } // todo not sure what type it will be
  }).validator(),
  run({ _id }) {
    // must have manageBlog permissions
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const stringValue = EJSON.stringify(value);
    const update = EJSON.parse("{\"" + field + "\":" + stringValue + "}");

    return Posts.update(_id, {$set: update});
  }
});

/**
 * publishPost
 * @summary toggles post's visibility flag
 * @type {ValidatedMethod}
 * @param {String} _id - postId
 * @returns {Boolean} post.isVisible
 */
export const publishPost = new ValidatedMethod({
  name: "publishPost",
  validate: new SimpleSchema({
    _id: { type: String }
  }).validator(),
  run({ _id }) {
    // must have manageBlog permissions
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const post = Posts.findOne(_id, {fields: {isVisible: 1}});
    
    const fields = {isVisible: !post.isVisible};
    // if post will be made visible, update publishedAt date 
    if(!post.isVisible) {
      fields.publishedAt = new Date();
    }

    // update post visibility
    ReactionCore.Log.info("toggle post visibility ", _id, !post.isVisible);
    
    const res = Posts.update(_id, {$set: fields});
    
    // if collection updated we return new `isVisible` state
    return res === 1 && !post.isVisible;
  }
});

/**
 * recommendPost
 * @summary toggles post's recommended flag
 * @type {ValidatedMethod}
 * @param {String} _id - postId
 * @returns {*} update result
 */
export const recommendPost = new ValidatedMethod({
  name: "recommendPost",
  validate: new SimpleSchema({
    _id: { type: String }
  }).validator(),
  run({ _id }) {
    // must have manageBlog permissions
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    
    const post = Posts.findOne(_id, {fields: {isRecommended: 1}});
    return Posts.update(_id, {$set: {isRecommended: !post.isRecommended}});
  }
});

/**
 * removePosts
 * @summary removes posts in blog
 * @type {ValidatedMethod}
 * @param {Array} postsIds - ids of posts to be removed
 * @returns {Number} number of removed posts
 */
export const removePosts = new ValidatedMethod({
  name: "removePosts",
  validate: new SimpleSchema({
    ids: { type: [String] }
  }).validator(),
  run({ ids }) {
    // must have manageBlog permissions
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    return Posts.remove({_id: {$in: ids}});
  }
});

/** @todo
 * updatePostPosition
 * @summary update product grid positions
 * @type {ValidatedMethod}
 * @param {Object} 
 * @returns {String} 
 */
export const updatePostPosition = new ValidatedMethod({
  name: "updatePostPosition",
  validate: new SimpleSchema({
    values: { type: postValues }
  }).validator(),
  run({ values }) {
    // must have manageBlog permissions
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    // todo
    return Posts.insert(values);
  }
});
