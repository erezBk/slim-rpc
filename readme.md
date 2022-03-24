# slim-rpc

## Features
- no brainer minimal function that wraps express routes 
- writing simple input-output functions instead of routes
- all requests are POST under the hood like graphql
- generating type safe domain driven RPC client lib with a single command
- each RPC function returns a function that can be used to call the RPC function 
  use case : for pre fetching data and then using some template engine to send back html

## setting call Context
```ts
// inside index.d.ts in your src root folder
import "slim-rpc"

declare module "slim-rpc"{
  export interface Context{
     // whatever you want to add ...
     services:{
       author:()=>string
     }
  } 
}


```