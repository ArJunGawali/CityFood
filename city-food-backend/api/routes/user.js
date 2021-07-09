const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
// const upload = multer({ dest: "uploads/" });
const upload = multer({ storage: storage });

const User = require("../../models/User");
const Product = require("../../models/Product");
const Shop = require("../../models/Shops");

const checkAuth = require("../middleware/check-auth");
router.get("/:userId", (req, res, next) => {
  const id = req.params.userId;
  User.findById(id)
    .exec()
    .then((doc) => {
      res.status(200).json({
        message: "User found",
        userData: doc,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/", checkAuth, (req, res, next) => {
  User.find()
    .select("_id name email password verify")
    .exec()
    .then((doc) => {
      console.log(doc);
      res.status(201).json({
        count: doc.length,
        users: doc.map((user) => {
          return {
            userData: user,
            request: {
              type: "GET",
              url: "http://localhost:3000/api/v1/user/" + user._id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((result) => {
      if (result.length >= 1) {
        console.log("Error : Email already exist");
        return res.status(409).json({
          message: "Email already exist",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            console.log(err);
            res.status(401).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              name: req.body.name,
              email: req.body.email,
              password: hash,
              verify: false,
            });
            user
              .save()
              .then((doc) => {
                const confirmToken = jwt.sign(
                  {
                    _id: doc._id,
                  },
                  "secretkeys",
                  {
                    expiresIn: "1d",
                  }
                );
                const url =
                  "http://localhost:3000/api/v1/user/confirmation/" +
                  confirmToken;
                const transporter = nodemailer.createTransport({
                  host: "smtp.gmail.com",
                  port: 587,
                  auth: {
                    user: "arjungawali111@gmail.com",
                    pass: "26Jan1999",
                  },
                });
                transporter
                  .sendMail({
                    from: "arjungawali111@gmail.com",
                    to: doc.email,
                    subject: "confirmation",
                    html: `Confirm your mail ${url} `,
                  })
                  .then((resp) => console.log(resp))
                  .catch((e) => console.log(e));
                console.log(doc);
                res.status(200).json({ doc, confirmToken: confirmToken });
              })
              .catch((err) => console.log(err));
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(404).json({
          message: "Auth Failed",
        });
      }
      console.log(user[0].verify);

      if (user[0].verify === false) {
        return res.json({
          message: "Please verify your email. Confirmation link sent.",
          verify: false,
        });
      } else {
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: err });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                _id: user[0]._id,
              },
              "secretkey",
              {
                expiresIn: "5h",
              }
            );
            res.status(201).json({
              message: "Auth Successfull",
              _id: user[0]._id,
              token: token,
            });
          } else {
            return res.status(409).json({
              message: "Auth Failed",
            });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: err });
    });
});

router.delete("/:userId", (req, res, next) => {
  const id = req.params.userId;
  User.find({ _id: id })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        User.remove({ _id: id })
          .exec()
          .then((user) => {
            console.log(user);
            res.status(200).json(user);
          })
          .catch((err) => {
            console.log(err);
            res.json({ message: err });
          });
      } else {
        console.log("Id not Found");
        res.status(404).json({ message: "Id not found" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({ message: err });
    });
});

router.get("/confirmation/:Token", (req, res, next) => {
  const Token = req.params.Token;
  const decode = jwt.verify(Token, "secretkeys");
  if (decode) {
    User.updateOne({ _id: decode._id }, { $set: { verify: true } }, function (
      err,
      result
    ) {
      if (err) {
        console.log(err);
        res.status(500).json(err);
      }
      res.status(200).json({ message: "Verified" });
    });
  }
});

// router.post("/products", upload.single("productImage"), (req, res, next) => {
//   console.log(req.file);
//   const product = new Product({
//     _id: new mongoose.Types.ObjectId(),
//     name: req.body.name,
//     price: req.body.price,
//     image: req.file.path,
//   });
//   console.log("down");
//   product
//     .save()
//     .then((result) => {
//       console.log(result);
//       res.status(200).json(result);
//     })
//     .catch((err) => {
//       console.log(err, "Big Error ");
//       res.status(500).json(err);
//     });
// });

// router.post("/:userId/shop", upload.single("shopImage"), (req, res, next) => {
//   console.log(req.file);
//   const shop = new Shop({
//     _id: new mongoose.Types.ObjectId(),
//     userId: req.params.userId,
//     name: req.body.name,
//     image: req.file.path,
//     mobileNo: req.body.mobileNo,
//   });
//   console.log("down");
//   shop
//     .save()
//     .then((result) => {
//       console.log(result);
//       res.status(200).json(result);
//     })
//     .catch((err) => {
//       console.log(err, "Big Error ");
//       res.status(500).json(err);
//     });
// });

// router.get("/shop", (req, res, next) => {
//   console.log(Shop);
//   Shop.find()
//     // .select("_id name image mobileNo")
//     .exec()
//     .then((doc) => {
//       console.log(doc);
//       res.status(201).json({
//         count: doc.length,
//         users: doc.map((user) => {
//           return {
//             userData: user,
//             request: {
//               type: "GET",
//               url: "http://localhost:3000/api/v1/user/shop" + user._id,
//             },
//           };
//         }),
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

module.exports = router;
