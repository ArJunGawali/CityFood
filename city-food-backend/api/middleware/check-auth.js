const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ");
    console.log(token);
    const decode = jwt.verify(token[1], "secretkey");
    res.userData = decode;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Auth Failed",
    });
  }
};
