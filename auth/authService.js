import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "./authModel.js";

const register = async (email, password,name) => {
  const existing = await UserModel.findByEmail(email);
  if (existing) throw { status: 409, message: "Email already registered." };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await UserModel.createUser(email, hashedPassword,name);
  return user;
};

const login = async (email, password) => {
  const user = await UserModel.findByEmail(email);
  if (!user) throw { status: 401, message: "Invalid credentials." };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 401, message: "Invalid credentials." };

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  return token;
};

export default { register, login };