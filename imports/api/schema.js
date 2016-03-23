import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ReactionCore } from "meteor/reactioncommerce:core";

// todo labels. i18n for labels??

ReactionCore.Schemas.Posts = new SimpleSchema({
  _id: {
    type: String
  },
  shopId: {
    type: String,
    index: 1,
    autoValue: ReactionCore.shopIdAutoValue,
    label: "Post shopId"
  },
  title: {
    type: String,
    defaultValue: "",
    index: 1   // todo check indexes
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
  handle: {
    type: String,
    optional: true,
    index: 1,
    autoValue: function () {
      let slug = this.value ||  getSlug(this.siblingField("title").value) || 
        this.siblingField("_id").value || "";
      if (this.isInsert) {
        return slug;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: slug
        };
      }
    }
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
    index: 1,
    defaultValue: false
  },
  isRecommended: {
    type: Boolean,
    index: 1,
    defaultValue: false
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    }
  },
  publishedAt: {
    type: Date,
    optional: true
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      return new Date;
    },
    optional: true
  }
});
