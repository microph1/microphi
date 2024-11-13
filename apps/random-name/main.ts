import { Application } from "https://deno.land/x/oak@14.2.0/mod.ts";
import { getRandomName } from "./random-name.ts";


const app = new Application();

app.use((ctx) => {
  const randomName = getRandomName();
  console.log({randomName});

  ctx.response.body = randomName;
});

await app.listen({ port: 8000 });
