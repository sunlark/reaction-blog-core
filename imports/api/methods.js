import { Meteor } from "meteor/meteor";
import { EJSON } from "meteor/ejson";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ReactionCore } from "meteor/reactioncommerce:core";
import { check, Match } from "meteor/check";
import { Transliteration } from "meteor/ongoworks:transliteration";
import Posts from "./collections";
import { createHandle/*, getSlug*/ } from "./helpers";
// import PostSchema from "./schema";

// FIXME remove this after npm version will be fixed. Currently it has this line
// `codemap[offset] = require(`../../data/x${offset.toString(16)}.json`);`
// which can't find file
let getSlug;
if (Meteor.isClient) {
  getSlug = function (slugString) {
    return slugString && TR.slugify(slugString);
  };
} else if (Meteor.isServer) {
  getSlug = function (slugString) {
    return slugString && Transliteration.slugify(slugString);
  };
}

/**
 * createPost
 * @summary creates an empty post object for blog
 * @type {ValidatedMethod}
 * @return {String} id of created post
 */
export const create = new ValidatedMethod({
  name: "blog.create",
  validate: null,
  run() {
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    return Posts.insert({}, { validate: false });
  }
});

/**
 * deletePosts
 * @summary removes a list of posts
 * @type {ValidatedMethod}
 * @param {Array} postIds - an array with posts _ids
 * @return {Number} of successfully removed documents
 */
export const deletePosts = new ValidatedMethod({
  name: "blog.deletePosts",
  validate: new SimpleSchema({
    postIds: { type: [String] }
  }).validator(),
  run({ postIds }) {
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    return Posts.remove({ _id: { $in: postIds } });
  }
});

/**
 * deleteMedia
 * @summary removes media documents related to removed posts
 * @type {ValidatedMethod}
 * @param {Array} postIds - an array with removed posts _ids
 * @return {Number} of successfully removed media documents
 */
export const deleteMedia = new ValidatedMethod({
  name: "blog.deleteMedia",
  validate: new SimpleSchema({
    postIds: { type: [String] }
  }).validator(),
  run({ postIds }) {
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error(403, "Access Denied");
    }
// TODO: complete this method
    // return Posts.remove({ _id: { $in: postIds } });
  }
});

/**
 * updateSettings
 * @summary update blog settings
 * @type {ValidatedMethod}
 * @param {Object} values - object with blog settings from form
 * @return {Number} mongodb update result
 */
export const updateSettings = new ValidatedMethod({
  name: "blog.updateSettings",
  validate: new SimpleSchema({
    defaultTag: { type: String }
  }).validator(),
  run(values) {
    // must have manageBlog permissions
    if (!ReactionCore.hasPermission("reaction-blog-core/blogSettings")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    // TODO maybe we should send shopId from the client side, because I'm not sure,
    // we got it in correct way here, on server side
    const shopId = ReactionCore.getShopId();

    return ReactionCore.Collections.Packages.update({
      name: "reaction-blog-core",
      shopId: shopId
    }, {
      $set: { settings: values }
    });
  }
});

/**
 * addTag
 * @summary adds new tag to post
 * @type {ValidatedMethod}
 * @param {String} postId - post _id
 * @param {String} tagName - added tag name
 * @return {Number} mongodb update result
 */
export const addTag = new ValidatedMethod({
  name: "blog.addTag",
  validate: new SimpleSchema({
    postId: { type: String },
    tagName: { type: String }
  }).validator(),
  run({ postId, tagName }) {
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error("blog.posts.addTag.accessDenied",
        "You don't have permissions to add tag to this post.");
    }

    // tag could be undefined
    const existingTag = ReactionCore.Collections.Tags.findOne({ name: tagName });
    // `existingTag` should always be defined
    if (!existingTag) {
      throw new Meteor.Error("blog.posts.addTag.tagNotFound", "Tag not found.");
    }
    const postHasTag = Posts.find({
      _id: postId,
      hashtags: {
        $in: [existingTag._id]
      }
    }).count();
    if (postHasTag) {
      throw new Meteor.Error("blog.posts.addTag.existingTag", "Existing Tag, Update Denied.");
    }

    return Posts.update({ _id: postId }, { $push: { hashtags: existingTag._id }});
  }
});

/**
 * removeTag
 * @summary removes tag from post
 * @type {ValidatedMethod}
 * @param {String} postId - post _id
 * @param {String} tagId - tag _id
 * @return {Number} mongodb update result
 */
export const removeTag = new ValidatedMethod({
  name: "blog.removeTag",
  validate: new SimpleSchema({
    postId: { type: String },
    tagId: { type: String }
  }).validator(),
  run({ postId, tagId }) {
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error("blog.posts.removeTag.accessDenied",
        "You don't have permissions to remove tag from this post.");
    }

    return Posts.update(postId, { $pull: { hashtags: tagId } });
  }
});

/**
 * updatePostField
 * @summary update single post field
 * @type {ValidatedMethod}
 * @param {String} _id - post.id to update
 * @param {String} field - key to update
 * @param {*} value - update property value
 * @returns {Number} mongodb update result
 */
export const updatePostField = new ValidatedMethod({
  name: "blog.updatePostField",
  validate({ postId, field, value }) {
    check(postId, String);
    check(field, String);
    check(value, Match.OneOf(String, Object, Array, Boolean));
  },
  // validate: new SimpleSchema({
  //   postId: { type: String },
  //   newFieldContent: { type: Object, blackbox: true }
  //   // field: { type: String },
  //   // value: { type: Match.OneOf(String, Object, Array, Boolean) } // todo not sure what type it will be
  // }).validator(),
  run({ postId, field, value }) {
    // must have manageBlog permissions
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    // TODO this is taken from `products/updateProductField`. Do we need this
    // here or it could be simplified in a simple object?
    const stringValue = EJSON.stringify(value);
    const update = EJSON.parse("{\"" + field + "\":" + stringValue + "}");

    return Posts.update(postId, { $set: update });
  }
});

/**
 * publishPost
 * @summary toggles post's visibility flag
 * @type {ValidatedMethod}
 * @param {String} _id - postId
 * @returns {Boolean} post.isVisible
 */
export const publishPosts = new ValidatedMethod({
  name: "blog.publishPosts",
  validate: new SimpleSchema({
    postIds: { type: [String] }
  }).validator(),
  run({ postIds }) {
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const posts = Posts.find({
      _id: { $in: postIds }
    }, {
      fields: { title: 1, isVisible: 1 }
    });

    return posts.map(post => {
      // we need to do small validation here.
      // post title is required
      if (post && post.title.length < 1) {
        ReactionCore.Log.warn(`Impossible to publish post: ${post._id}. Title missing.`);
        throw new Meteor.Error("blog.publishPost.titleMissing",
          "Impossible to publish post. Title missing.");
      }
      const newVisibilityState = !post.isVisible;
      const fields = { isVisible: newVisibilityState };
      // if we change state to "visible", we also want to update publishedAt date
      if(newVisibilityState) {
        fields.publishedAt = new Date();
      }

      // update post visibility
      ReactionCore.Log.info("toggle post visibility ", post._id, newVisibilityState);

      const res = Posts.update(post._id, { $set: fields });

      // if collection updated we return new `isVisible` state
      return res === 1 && {
        _id: post._id,
        title: post.title,
        isVisible: newVisibilityState
      };
    });
  }
});

/**
 * updateHandle
 * @summary
 * @type {ValidatedMethod}
 * @param {String} postId - post _id
 * @return {String} new handle
 */
export const updateHandle = new ValidatedMethod({
  name: "blog.updateHandle",
  validate: new SimpleSchema({
    postId: { type: String }
  }).validator(),
  run({ postId }) {
    if (!ReactionCore.hasPermission("manageBlog")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    const post = Posts.findOne(postId, { fields: { title: 1 } });
    const handle = createHandle(getSlug(post.title), postId);

    const res = Posts.update(postId, {$set: { handle }});

    // if updated successfully -- return new handle, else return result with Error
    return res === 1 ? handle : res;
  }
});

//
// /**
//  * recommendPost
//  * @summary toggles post's recommended flag
//  * @type {ValidatedMethod}
//  * @param {String} _id - postId
//  * @returns {*} update result
//  */
// export const recommendPost = new ValidatedMethod({
//   name: "recommendPost",
//   validate: new SimpleSchema({
//     _id: { type: String }
//   }).validator(),
//   run({ _id }) {
//     // must have manageBlog permissions
//     if (!ReactionCore.hasPermission("manageBlog")) {
//       throw new Meteor.Error(403, "Access Denied");
//     }
//
//     const post = Posts.findOne(_id, {fields: {isRecommended: 1}});
//     return Posts.update(_id, {$set: {isRecommended: !post.isRecommended}});
//   }
// });
//
// /**
//  * removePosts
//  * @summary removes posts in blog
//  * @type {ValidatedMethod}
//  * @param {Array} postsIds - ids of posts to be removed
//  * @returns {Number} number of removed posts
//  */
// export const removePosts = new ValidatedMethod({
//   name: "removePosts",
//   validate: new SimpleSchema({
//     ids: { type: [String] }
//   }).validator(),
//   run({ ids }) {
//     // must have manageBlog permissions
//     if (!ReactionCore.hasPermission("manageBlog")) {
//       throw new Meteor.Error(403, "Access Denied");
//     }
//     return Posts.remove({_id: {$in: ids}});
//   }
// });
//
// /** @todo
//  * updatePostPosition
//  * @summary update product grid positions
//  * @type {ValidatedMethod}
//  * @param {Object}
//  * @returns {String}
//  */
// export const updatePostPosition = new ValidatedMethod({
//   name: "updatePostPosition",
//   validate: new SimpleSchema({
//     values: { type: postValues }
//   }).validator(),
//   run({ values }) {
//     // must have manageBlog permissions
//     if (!ReactionCore.hasPermission("manageBlog")) {
//       throw new Meteor.Error(403, "Access Denied");
//     }
//     // todo
//     return Posts.insert(values);
//   }
// });
