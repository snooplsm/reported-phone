import { scalarResolvers } from "./scalars";

import { resolvers } from "./resolvers";

export const resolversWithScalars = (includeScalars = false) => {
  return includeScalars ? { ...scalarResolvers, ...resolvers } : resolvers;
};