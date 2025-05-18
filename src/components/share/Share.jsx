import "./share.css";
import {
  PermMedia,
  Label,
  Room,
  EmojiEmotions,
  Cancel,
} from "@mui/icons-material";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

export default function Share() {
  const { user } = useContext(AuthContext);
  const desc = useRef();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const PF = "http://localhost:8800/api/public/images/";

  const submitHandler = async (e) => {
    e.preventDefault();
    const API_BASE = "http://localhost:8800/api";
  
    if (!user || !user._id) {
      alert("Utilisateur non authentifié.");
      return;
    }
  
    if (!desc.current.value.trim() && !file) {
      alert("Veuillez ajouter une description ou une image.");
      return;
    }
  
    setIsUploading(true);
  
    const newPost = {
      userId: user._id,
      desc: desc.current.value.trim(),
    };
  
    try {
      // Upload image si présente
      if (file) {
        const data = new FormData();
        data.append("image", file);
        data.append("type", "post");
        data.append("userId", user._id);
  
        const uploadRes = await axios.post(`${API_BASE}/upload/a/`, data);
        const uploadedFileName = uploadRes.data.filename;
  
        newPost.img = uploadedFileName;
      }
  
      // Création du post
      const response = await axios.post(`${API_BASE}/posts`, newPost, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      desc.current.value = "";
      setFile(null);
      console.log("Post créé avec succès :", response.data);
    } catch (err) {
      console.error("Erreur lors de la création du post :", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      alert(err.response?.data?.message || "Échec de la création du post.");
    } finally {
      setIsUploading(false);
      window.location.reload(); // ⬅️ Rafraîchissement de la page
    }
  };
  
  
  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <img
            className="shareProfileImg"
            src={
              user.profilePicture
                ? PF + user.profilePicture
                : PF + "mpp.jpeg"
            }
            alt=""
          />
          <input
            placeholder={"What's in your mind " + user.username + "?"}
            className="shareInput"
            ref={desc}
          />
        </div>
        <hr className="shareHr" />
        {file && (
          <div className="shareImgContainer">
            <img
              className="shareImg"
              src={URL.createObjectURL(file)}
              alt=""
            />
            <Cancel
              className="shareCancelImg"
              onClick={() => setFile(null)}
            />
          </div>
        )}
        <form className="shareBottom" onSubmit={submitHandler}>
          <div className="shareOptions">
            <label htmlFor="file" className="shareOption">
              <PermMedia htmlColor="tomato" className="shareIcon" />
              <span className="shareOptionText">Photo or Video</span>
              <input
                style={{ display: "none" }}
                type="file"
                id="file"
                accept=".png,.jpeg,.jpg"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            <div className="shareOption">
              <Label htmlColor="blue" className="shareIcon" />
              <span className="shareOptionText">Tag</span>
            </div>
            <div className="shareOption">
              <Room htmlColor="green" className="shareIcon" />
              <span className="shareOptionText">Location</span>
            </div>
            <div className="shareOption">
              <EmojiEmotions htmlColor="goldenrod" className="shareIcon" />
              <span className="shareOptionText">Feelings</span>
            </div>
          </div>
          <button className="shareButton" type="submit" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Share"}
          </button>
        </form>
      </div>
    </div>
  );
}
