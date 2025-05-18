import axios from "axios";
import { useRef } from "react";
import "./register.css";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault();

    // Vérification des mots de passe
    if (passwordAgain.current.value !== password.current.value) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      // Appel API vers le backend
      await axios.post("http://localhost:8800/api/auth/register", {
        username: username.current.value,
        email: email.current.value,
        password: password.current.value,
      });

      // Redirection après succès
      navigate("/login");

    } catch (err) {
      console.error("Erreur frontend:", err.response?.data || err.message);
      alert("Échec de l'inscription : " + (err.response?.data || "Erreur serveur"));
    }
  };

  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">Novasocial</h3>
          <span className="loginDescription">
            Connect with friends and the world around you on Novasocial.
          </span>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={handleClick}>
            <input placeholder="Username" required ref={username} className="loginInput" />
            <input placeholder="Email" required ref={email} type="email" className="loginInput" />
            <input placeholder="Password" required ref={password} type="password" className="loginInput" minLength="6" />
            <input placeholder="Password Again" required ref={passwordAgain} type="password" className="loginInput" />
            <button className="loginButton" type="submit">Sign Up</button>
            <button className="loginRegisterButton" onClick={()=>{navigate("/login");}}>Log into Account</button>
          </form>
        </div>
      </div>
    </div>
  );
}