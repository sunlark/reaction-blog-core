/* eslint-disable prefer-arrow-callback */

import { Meteor } from "meteor/meteor";
import { ReactionCore } from "meteor/reactioncommerce:core";
import Posts from "../collections.js";

//
// define search filters as a schema so we can validate
// params supplied to the posts publication
//
const filters = new SimpleSchema({
  query: {
    type: String,
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

/**
 * certain post of blog
 * @params {String} _id - id of post
 * @return {Object} return post cursor
 */
Meteor.publish("Post", function (_id) {
  check(_id, String);

  const shopId = ReactionCore.getShopId();
  if (! shopId) {
    return this.ready();
  }

  let selector = { "_id": _id };
  selector.isVisible = true;

  // simple user can see only visible post, admin user - any post
  if (Roles.userIsInRole(this.userId, ["owner", "admin", "manageBlog"],
      shopId)) {
    selector.isVisible = {
      $in: [true, false]
    };
  }

  return Posts.find(selector);
});

/**
 * posts of blog
 * @params {Boolean} recommendedOnly
 * @return {Object} return posts cursor
 */
Meteor.publish("Posts", function (recommendedOnly = false) {
  check(recommendedOnly, Boolean);

  const shopId = ReactionCore.getShopId();
  if (! shopId) {
    return this.ready();
  }

  let selector = { };
  selector.isVisible = true;
  if(recommendedOnly) {
    selector.isRecommended = true;
  }
  // todo get posts by tag

  // simple user can see only visible post, admin user - any post
  if (Roles.userIsInRole(this.userId, ["owner", "admin", "manageBlog"],
      shopId)) {
    selector.isVisible = {
      $in: [true, false]
    };
  }

  return Posts.find(selector, {order: {publishedAt: -1}});
});

/**
 * all posts in blog
 * @params {Object} postsFilter
 */

Meteor.publish("AllPosts", function (postsFilter) {
  check(postsFilter, Match.OneOf(undefined, filters));
  
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }

  
  let selector = { shopId: shopId };
  if(postsFilter) {
    // filter by query
    if(postsFilter.query) {
      const cond = {
        $regex: postsFilter.query,
        $options: "i"
      };
      //selector todo
    }

    // todo filter by tag
    
    if(postsFilter.visibility !== undefined) { // todo
      selector.isVisible = postsFilter.visibility;
    }

    if(postsFilter.recomendation !== undefined) { // todo
      selector.isRecommended = postsFilter.recomendation;
    }
  }
  
  // todo pagination?
  // global admin can get all accounts
  // todo sort by positions
  if (Roles.userIsInRole(this.userId, ["admin", "owner", "managePosts"], shopId)) {
    return Posts.find(selector, {sort: {createdAt: -1}});
  }
  return this.ready();
});
