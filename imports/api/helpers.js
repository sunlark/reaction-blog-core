// import { slugify } from "transliteration";
// import Transliteration from "meteor/ongoworks:transliteration";
import Posts from "./collections.js";

/**
 * @function createHandle
 * @description Recursive method which trying to find a new `handle`, given the
 * existing copies
 * @param {String} postHandle - post `handle`
 * @param {String} postId - current post `_id`
 * @return {String} handle - modified `handle`
 */
export const createHandle = (postHandle, postId) => {
  let handle = postHandle || "";
  // exception postId needed for cases then double triggering happens
  const handleCount = Posts.find({
    _id: {
      $nin: [postId]
    },
    handle
  }).count();
  // current "copy" number
  let handleNumberSuffix = 0;
  // handle prefix
  let handleString = handle;
  // copySuffix "-copy-number" suffix of post
  const copySuffix = handleString.match(/-copy-\d+$/) || handleString.match(/-copy$/);
  // if post is a duplicate, we should take the copy number, and cut
  // the handle
  if (copySuffix) {
    // we can have two cases here: copy-number and just -copy. If there is
    // no numbers in copySuffix then we should put 1 in handleNumberSuffix
    handleNumberSuffix = +String(copySuffix).match(/\d+$/) || 1;
    // removing last numbers and last "-" if it presents
    handleString = handle.replace(/\d+$/, "").replace(/-$/, "");
  }

  // if we have more than one post with the same handle, we should mark
  // it as "copy" or increment our product handle if it contain numbers.
  if (handleCount > 0) {
    // if we have post with name like "post4", we should take care
    // about its uniqueness
    if (handleNumberSuffix > 0) {
      handle = `${handleString}-${handleNumberSuffix + handleCount}`;
    } else {
      // first copy will be "...-copy", second: "...-copy-2"
      handle = `${handleString}-copy${ handleCount > 1
        ? "-" + handleCount : ""}`;
    }
  }

  // we should check again if there are any new matches with DB
  if (Posts.find({ handle }).count() !== 0) {
    handle = createHandle(handle, postId);
  }

  return handle;
};

// This one for server usage only
// export const getSlug = slug => {
//   debugger;
//   const ss = slugify(slug);
//   slug && slugify(slug);
// }
