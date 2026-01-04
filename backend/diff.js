import jsondiffpatch from "jsondiffpatch";

export const diffEngine = jsondiffpatch.create({
  arrays: {
    detectMove: false
  }
});
