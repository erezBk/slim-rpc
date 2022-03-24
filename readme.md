# slim-rpc

## Why should I use this ?
- thinking purely on business logic instead on conventions like http methods / headers etc.
- writing simple input-output functions instead of routes
- generating type safe domain driven RPC client lib with a single command !
- each RPC function returns a function that can be used to call the RPC function 
     - use case 1 : for pre fetching data and then using some template engine to send back html
     - user case 2 : to be used inside other RPC calls.

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