import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';

// creates a subscription ready Apollo Client instance
export default function makeApolloClient() {
  const scapholdUrl = 'us-west-2.api.scaphold.io/graphql/safewalk-me';
  const graphqlUrl = `https://${scapholdUrl}`;
  const websocketUrl = `wss://${scapholdUrl}`;
  const networkInterface = createNetworkInterface({uri: graphqlUrl});

  networkInterface.use([{
    applyMiddleware(req, next) {
      // Easy way to add authorization headers for every request
      if (!req.options.headers) {
        req.options.headers = {};  // Create the header object if needed.
      }
      // TODO: add user auth stuff...
      //
      // if (await asyncStorage.getItem('@store:scaphold_user_token')) {
        // This is how to authorize users using http auth headers
      req.options.headers.Authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0OTY1MTg3MTcsImlhdCI6MTQ5NTIyMjcxNywiYXVkIjoiODQ1ODAxYmYtMjYzYy00NzAyLWFmMGItYzllNDVmNTdlNDIyIiwiaXNzIjoiaHR0cHM6Ly9zY2FwaG9sZC5pbyIsInN1YiI6IjIifQ.AsP497YdYwEak-_CfA4C-B9SOOqXTzDYkMMka9DCghc`;
      // }
      next();
    },
  }]);

  const wsClient = new SubscriptionClient(websocketUrl, {reconnect: true});
  const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(networkInterface, wsClient);

  const clientGraphql = new ApolloClient({
    networkInterface: networkInterfaceWithSubscriptions
  });
  return clientGraphql;
}
