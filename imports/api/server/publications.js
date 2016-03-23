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

/**
 * certain post of blog
 * @param {String} _id - id of post
 * @returns {Object} return post cursor
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
 * posts in blog 
 * @param {Object} postsFilter
 * @returns {Object} return posts cursor
 */

Meteor.publish("Posts", function (postsFilter) {
  check(postsFilter, Match.OneOf(undefined, filters));
  
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  
  const isAdmin = Roles.userIsInRole(this.userId, 
    ["admin", "owner", "managePosts"], shopId);
  
  let selector = { shopId: shopId };
  selector.isVisible = true;
  if(isAdmin) {
    selector.isVisible = {
      $in: [true, false]
    };
  }
  
  if(postsFilter) {
    // filter by query todo check syntax
    if(postsFilter.query) {
      const cond = {
        $regex: postsFilter.query,
        $options: "i"
      };
      selector["$or"] = [{
          title: cond
        }, {
          pageTitle: cond
        }, {
          keywords: cond
        }, {
          body: cond
      }
      ]
    }

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
  return Posts.find(selector, {sort: {publishedAt: -1}});
});
