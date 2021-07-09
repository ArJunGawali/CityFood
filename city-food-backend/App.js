const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const userRouter = require("./api/routes/user");
const shopRouter = require("./api/routes/shop");
const bodyParser = require("body-parser");

mongoose.connect(
  "mongodb+srv://arjun:08Oct2000@cluster0.opb18.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    connectTimeoutMS: 10000,
    poolSize: 10,
    writeConcern: {
      j: true,
    },
  }
);

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-with,Accept,Content-Type,Authorization"
//   );
//   if (req.method === "OPTIONS") {
//     res.header("Access-Control-Allow-Method", "PUT,POST,DELETE,GET,PATCH");
//     return res.status(200).json({});
//   }
// });
app.use(express.static("uploads"));
app.use("/api/v1/user", userRouter);
app.use("/api/v1/shop", shopRouter);

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 400);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
