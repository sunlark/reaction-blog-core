import { Meteor } from "meteor/meteor";
import { ReactionCore } from "meteor/reactioncommerce:core";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Roles } from "meteor/alanning:roles";
import { check, Match } from "meteor/check";
import Posts from "../collections.js";

const MAX_POSTS = 48;

//
// define search filters as a schema so we can validate
// params supplied to the posts publication
//
const filters = new SimpleSchema({
  query: {
    type: String,
    optional: true
  },
  tags: {
    type: [String],
    optional: true
  },
  visibility: {
    type: Boolean,
    optional: true
  },
  recomendation: {
    type: Boolean,
    optional: true
  }
});

Meteor.publish("Post", function (postId) {
  check(postId, String);

  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }

  let selector = { isVisible: true };

  // simple user can see only visible post, admin user - any post
  if (Roles.userIsInRole(this.userId, ["owner", "admin", "manageBlog"], shopId)) {
    selector.isVisible = {
      $in: [true, false]
    };
  }

  if (postId.match(/^[A-Za-z0-9]{17}$/)) {
    selector._id = postId;
  } else {
    selector.handle = {
      $regex: postId,
      $options: "i"
    };
  }

  return Posts.find(selector);
});

Meteor.publish("Posts", function (limit = 24, postsFilter = {}, sort = { publishedAt: -1 }) {
  check(limit, Match.Optional(Number));
  check(postsFilter, Match.Optional(Object));
  check(sort, Match.Optional(Object));
  // FIXME we need to get rid of audit-argument-check to make this work
  // new SimpleSchema({
  //   limit: { type: Number, optional: true },
  //   sort: { type: Object, optional: true, blackbox: true }
  // }).validate({ limit, sort });

  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }

  const isAdmin = Roles.userIsInRole(this.userId, ["admin", "owner", "managePosts"], shopId);

  let selector = { shopId };
  selector.isVisible = true;
  if(isAdmin) {
    selector.isVisible = {
      $in: [true, false]
    };
  }

  if(postsFilter) {
    // filter by tags
    if (postsFilter.tags) {
      Object.assign(selector, {
        hashtags: {
          $in: postsFilter.tags
        }
      });
    }

    // filter by query todo check syntax
    // if(postsFilter.query) {
    //   const cond = {
    //     $regex: postsFilter.query,
    //     $options: "i"
    //   };
    //   selector["$or"] = [{
    //       title: cond
    //     }, {
    //       pageTitle: cond
    //     }, {
    //       keywords: cond
    //     }, {
    //       body: cond
    //   }]
    // }

    // todo filter by tag

    if(postsFilter.recomendation !== undefined) { // todo check 'if'
      selector.isRecommended = postsFilter.recomendation;
    }

    // only admins can set visibility filter.
    if(postsFilter.visibility !== undefined && isAdmin) { // todo check 'if'
      selector.isVisible = postsFilter.visibility;
    }
  }

  // todo pagination?
  // todo sort by positions
  return Posts.find(selector, {
    sort: sort,
    limit: Math.min(limit, MAX_POSTS)
  });
});
