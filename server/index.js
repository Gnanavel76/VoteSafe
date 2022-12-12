require('dotenv').config()
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const electionAPIRoutes = require("./routes/electionAPI");
const contractAPIRoutes = require("./routes/contractAPI");
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/votesafe');
}
main().catch(err => console.log(err));

// use the routes specified in route folder
app.use("/api/v1/auth", authRoutes);
app.use("/contract", contractAPIRoutes);
app.use("/api/v1", electionAPIRoutes);

app.use(function (err, req, res, next) {
  console.log("next middleware", err);
  res.status(422).send({ error: err.message });
});

//listen to the server
app.listen(process.env.port || 9000, function () {
  console.log("listening to the port 9000 .....");
});
