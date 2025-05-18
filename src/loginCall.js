import axios from "axios";

export const loginCall = async (credentials, dispatch) => {
  dispatch({ type: "LOGIN_START" });
  try {
    const response = await axios.post(
      "http://localhost:8800/api/auth/login", // Assurez-vous que c'est la bonne URL
      credentials,
      {
        headers: { "Content-Type": "application/json" }
      }
    );
    dispatch({ type: "LOGIN_SUCCESS", payload: response.data });
  } catch (err) {
    dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });
    console.error("Login error:", err.response?.data || err.message);
  }
};

