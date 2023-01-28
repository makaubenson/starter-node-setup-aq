let AsyncError = require("./../utils/catchAsync");
let JWT = require("jsonwebtoken");

function generateToken(user) {
  return JWT.sign({ id: user._id, cpa: "Techkey" }, process.env.TOKENSECRETE, {
    expiresIn: process.env.TOKENDURATION,
  });
}
function generateCookie(res, token, req) {
  let COOKIEDURATION = 5; // XXX 5 days
  let options = {
    expires: new Date(Date.now() + COOKIEDURATION + 24 + 60 + 60),
    secure: process.env.NODE_ENV == "production" ? true : false,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    httpOnly: true,
  };
  res.cookie("JWT", token, options);
}

exports.login = AsyncError(async function (req, res, next) {
  let user = {
    _id: "04681-7351-2176242",
    name: "John Doe",
    id_no: 8219261,
    email: "john@example.com",
    role: "user",
    photo: "default.jpg",
    phone: "0700000000",
    active: true,
  };
  let token = generateToken(user);
  generateCookie(res, token, req);
  res.locals.user = user;
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protected = AsyncError(async function (req, res, next) {
  //get the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.JWT) {
    token = req.cookies.JWT;
  }
  // TODO Validate Token
  if (!token) {
    // TODO redirect to login
  }

  next();
});

exports.logout = function (req, res, next) {
  res.cookie("JWT", "logged out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.json({
    status: "success",
    message: "logged out",
  });
};
