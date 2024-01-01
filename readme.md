# slim-rpc
this project is my RPC implementation.<br>
I was very inspired by [trpc](https://github.com/trpc/trpc) lib and the way that it made
developing fullstack apps with such a good DX.<br>
but when inspected the code I was blown away by the size of the codebase :astonished:<br>
So I decided to create my own lib 😄 !

it's **under 400 lines of code!**
It's slim :)

The library comes with adapters for express, **koa** & **fastify** <br>
and input validation adapters for **zod** and **joi**
but you can also create an adapter of your own by implementing **WebFramework** <br>
take a look at the other adapters to understand what you need to do..it's very simple.

enjoy using :partying_face: