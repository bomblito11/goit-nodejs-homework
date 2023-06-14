const app = require("./app");
const mongoose = require("mongoose");

require("dotenv").config();

const PORT = process.env.PORT || 3000;
const uriDb = process.env.DB_URI;

const connection = mongoose.connect(uriDb, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

connection
  .then(() => {
    app.listen(PORT, function () {
      console.log("Server running. Use our API on port: 3000");
      console.log(`Database connection successful`);
    });
  })
  .catch((err) => {
    console.log(`Database connection failed. Error message: ${err.message}`);
    process.exit(1);
  });
