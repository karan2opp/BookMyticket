import AuthService from "./authService.js";

const register = async (req, res) => {
  try {
    const { email, password , name } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ error: "Email and password and name required." });

    const user = await AuthService.register(email, password,name);
    res.status(201).json({ message: "User registered.", user });
  } catch (ex) {
    res.status(ex.status || 500).json({ error: ex.message || "Internal server error." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required." });

    const token = await AuthService.login(email, password);
    res.json({ message: "Login successful.", token });
  } catch (ex) {
    res.status(ex.status || 500).json({ error: ex.message || "Internal server error." });
  }
};

export { register, login };