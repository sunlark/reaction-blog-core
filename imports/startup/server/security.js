import { Meteor } from "meteor/meteor";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";
import * as methods from "../../api/methods";
import { _ } from "meteor/underscore";

// Don't let people write arbitrary data to their 'profile' field from the client
Meteor.users.deny({
  update() {
    return true;
  }
});

const BLOG_METHODS = [];

_.each(methods, (method) => {
  // push only methods objects
  method.name && BLOG_METHODS.push(method.name);
});

if (Meteor.isServer) {
  // Only allow 2 login attempts per connection per 5 seconds
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(BLOG_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; }
  }, 2, 5000);
}
