import jwt from "jsonwebtoken";

const secret = "YSyzETSqDyh6RTe0WldN7ndqSQe7VYCyx0qk3ko62PI=";

const setToken = async (user) => {
  const payload = {
    _id: user._id,
    email: user.email,
    name: user.name,
  };

  const token = await jwt.sign(payload, secret, {
    expiresIn: "1d",
  });

  return token;
};

const verifyToken = async (token) => {
  try {
    const decoded = await jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return null;
  }
};

export { setToken, verifyToken };
