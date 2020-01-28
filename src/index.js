import "dotenv/config";

import server from "./server";

/**
 * TODO: replace instances of monent.utc() to use moment.tz
 */

// Start the server
const app = server();

const listener = app.listen(process.env.PORT || 3000, function() {
  const { port } = listener.address();
  console.log("Your app is listening on  http://localhost:" + port);
});
