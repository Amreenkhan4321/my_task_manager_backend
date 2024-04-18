const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
require("./src/config/DB_Config");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user", require("./src/routes/UserRoutes"));
app.use("/api",require("./src/routes/CommonRoutes"))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
