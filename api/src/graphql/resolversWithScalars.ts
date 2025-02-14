import { scalarResolvers } from "./scalars.js";

import { resolvers } from "./resolvers.js";

export const resolversWithScalars = (includeScalars = false) => {
  return includeScalars ? { ...scalarResolvers, ...resolvers } : resolvers;
};