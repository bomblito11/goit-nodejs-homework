const app = require("./app");
const fs = require("fs").promises;
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config();

const PORT = process.env.PORT || 3000;
const uriDb = process.env.DB_URI;

mongoose.Promise = global.Promise;

const connection = mongoose.connect(uriDb, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const isAccessible = (path) => {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};

const initializeDirectory = async (folder) => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder);
  }
};

connection
  .then(() => {
    app.listen(PORT, function () {
      initializeDirectory(path.join(process.cwd(), "tmp"));
      initializeDirectory(path.join(process.cwd(), "public", "avatars"));
      console.log("Server running. Use our API on port: 3000");
      console.log(`Database connection successful`);
    });
  })
  .catch((err) => {
    console.log(`Database connection failed. Error message: ${err.message}`);
    process.exit(1);
  });
