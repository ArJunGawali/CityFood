const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const Shop = require("../../models/Shops");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
// const upload = multer({ dest: "uploads/" });
const upload = multer({ storage: storage });

router.get("/", (req, res, next) => {
  console.log(Shop);
  Shop.find()
    // .select("_id name image mobileNo")
    .exec()
    .then((doc) => {
      console.log(doc);
      res.status(201).json({
        count: doc.length,
        users: doc.map((shop) => {
          return {
            shopData: shop,
            request: {
              type: "GET",
              url: "http://localhost:3000/api/v1/shop/" + shop._id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/:userId", (req, res, next) => {
  // console.log(Shop);
  const userId = req.params.userId;
  Shop.find({ userId: userId })
    // .select("_id name image mobileNo")
    .exec()
    .then((doc) => {
      console.log(doc);
      res.status(201).json({
        count: doc.length,
        users: doc.map((shop) => {
          return {
            shopData: shop,
            request: {
              type: "GET",
              url: "http://localhost:3000/api/v1/shop/" + shop._id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/", upload.single("shopImage"), (req, res, next) => {
  console.log(req.file);
  const shop = new Shop({
    _id: new mongoose.Types.ObjectId(),
    userId: req.params.userId,
    name: req.body.name,
    image: req.file.path,
    mobileNo: req.body.mobileNo,
    userId: req.body.userId,
  });
  console.log("down");
  shop
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err, "Big Error ");
      res.status(500).json(err);
    });
});

module.exports = router;
