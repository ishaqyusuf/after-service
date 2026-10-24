import { app } from "./index";

export default {
  fetch: app.fetch,
  port: Number(process.env.PORT ?? process.env.PORTLESS_APP_PORT ?? 4102),
};
