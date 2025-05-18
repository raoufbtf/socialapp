import "./profile.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";
import Feed from "../../components/feed/Feed";
import { useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const { user, dispatch } = useContext(AuthContext);
  const profileInputRef = useRef();
  const coverInputRef = useRef();
  const { username } = useParams();
  const [otheruser, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users?username=${username}`);
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [username]);

  const PF = "http://localhost:8800/api/public/images/";

  // Sécurisation d'accès à 
  const userData = user || {};

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const userId = userData._id;
    if (!userId) {
      console.error("UserId introuvable");
      return;
    }

    uploadImage(file, type, userId);
  };

  const uploadImage = async (file, type, userId) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("userId", userId);
    formData.append("type", type);

    try {
      const uploadRes = await fetch("http://localhost:8800/api/upload/a/", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error("Échec upload:", errorText);
        return;
      }

      const uploadData = await uploadRes.json();

      // Mise à jour utilisateur
      const updateRes = await fetch(`http://localhost:8800/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [type === "profile" ? "profilePicture" : "coverPicture"]: uploadData.filePath,
        }),
      });

      if (!updateRes.ok) {
        const err = await updateRes.text();
        console.error("Erreur update utilisateur:", err);
        return;
      }

      const updatedUser = await updateRes.json();

      dispatch({ type: "UPDATE_USER", payload: updatedUser });

      // Stocke updatedUser directement dans localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (err) {
      console.error("Erreur lors de l'upload ou update :", err);
    }
  };

  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              {/* Image de couverture */}
              <img
                className="profileCoverImg"
                src={
                  userData.coverPicture
                    ? PF + userData.coverPicture
                    : "https://i.postimg.cc/nhXZsppP/photo-2025-05-13-02-48-27.jpg"
                }
                alt="cover"
                onClick={() => coverInputRef.current.click()}
                style={{ cursor: "pointer" }}
              />
              <input
                type="file"
                ref={coverInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleImageChange(e, "cover")}
              />

              {/* Image de profil */}
              <img
                className="profileUserImg"
                src={
                  userData.profilePicture
                    ? PF + userData.profilePicture
                    : PF + "mpp.jpeg"
                }
                alt="profile"
                onClick={() => profileInputRef.current.click()}
                style={{ cursor: "pointer" }}
              />
              <input
                type="file"
                ref={profileInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleImageChange(e, "profile")}
              />


            </div>
            <div className="profileRightBottom">
              <Feed username={userData.username} />
              <Rightbar user={user} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
