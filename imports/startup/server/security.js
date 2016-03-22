import { Meteor } from "meteor/meteor";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";
import * as methods from "../../api/methods";
import { _ } from "meteor/underscore";

const COMMENTS_METHODS = [];

_.each(methods, (method) => {
  // push only methods objects
  method.name && COMMENTS_METHODS.push(method.name);
});

if (Meteor.isServer) {
  const commentRule = {
    name(name) {
      return COMMENTS_METHODS.some(method => method === name);
    },
    type: "method"
  };

  // Only allow 5 operations per connection per second
  DDPRateLimiter.addRule(commentRule, 5, 1000);
}
