import { Context } from "aws-lambda";
import { resolvers } from "api/src/graphql/resolvers";

interface AppSyncEvent {
  info: {
    parentTypeName: "Query" | "Mutation";
    fieldName: string;
  };
  arguments: Record<string, any>;
}

export const handler = async (event: AppSyncEvent, context: Context) => {
  console.log("Event received:", JSON.stringify(event, null, 2));
  
  const operationType = event.info.parentTypeName; // "Query", "Mutation", "Subscription"
  const fieldName = event.info.fieldName; // "getUsers", "createUser", etc.
  const args = event.arguments || {}; // GraphQL arguments

  const op:any = resolvers[operationType]
  const func:any = op[fieldName]
  return await func(null, args)
};