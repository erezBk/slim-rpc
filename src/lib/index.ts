export * from "./server";
export * from "./client";
export * from "./adapters";

/* 
 TODO: 
 2. add fastify & koa adapter support
 3. add req batching support to the client and server using .batch()
    - the server needs to have a "/batch" route or it should have a middleware 
      but that will be splitted between the different adapters     
 4. deploy V-0.0.1 to npm and use it.
*/
