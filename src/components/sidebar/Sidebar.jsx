import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom"; // ⬅️ Import pour la navigation

export default function QuickAddSnapStyleVertical() {
  const { user, dispatch } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [followedUsers, setFollowed] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ⬅️ Hook de navigation
  const PF = "http://localhost:8800/api/public/images/";

  useEffect(() => {
    if (!user?._id) return;

    const fetchRandomUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8800/api/users/random?count=10&userId=${user._id}`
        );
        if (!response.ok) {
          console.warn("Erreur API:", response.status, response.statusText);
          setUsers([]);
          setLoading(false);
          return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.warn("Données reçues invalides (non tableau) :", data);
          setUsers([]);
        }
      } catch (err) {
        console.error("Erreur fetch users random:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomUsers();
  }, [user]);

  useEffect(() => {
    if (!user?.followings) {
      setFollowed([]);
    } else {
      setFollowed(user.followings);
    }
  }, [user]);

  const handleClick = async (userItem) => {
    if (!user?._id || !userItem?._id) return;

    const isFollowed = followedUsers.includes(userItem._id);
    if (isFollowed) {
      return; // Ne rien faire si déjà suivi
    }

    try {
      await axios.put(`http://localhost:8800/api/users/${userItem._id}/follow`, {
        userId: user._id,
      });

      setFollowed((prev) => [...prev, userItem._id]);
      dispatch && dispatch({ type: "FOLLOW", payload: userItem._id });
    } catch (err) {
      console.error("Erreur lors du follow :", err);
      alert(err.response?.data || "Erreur lors de la mise à jour. Veuillez réessayer.");
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "20px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h3>Ajout rapide</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 10,
          border: "1px solid #ccc",
          borderRadius: 8,
          maxHeight: 500,
          overflowY: "auto",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: "#555" }}>Chargement...</div>
        ) : Array.isArray(users) && users.length > 0 ? (
          users.map((userItem) => {
            const isFollowed = followedUsers.includes(userItem._id);
            return (
              <div
                key={userItem._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 8,
                  borderRadius: 6,
                  border: isFollowed ? "2px solid #4caf50" : "1px solid #ddd",
                  backgroundColor: isFollowed ? "#e8f5e9" : "white",
                }}
              >
                {/* Image cliquable */}
                <img
                  src={
                    userItem?.profilePicture
                      ? PF + userItem.profilePicture
                      : PF + "mpp.jpeg"
                  }
                  alt={userItem.username || "User avatar"}
                  width={40}
                  height={40}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/profile/${userItem.username}`)}
                  title="Voir le profil"
                />

                {/* Infos utilisateur */}
                <div style={{ flexGrow: 1, overflow: "hidden" }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 14,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      color: "#1976d2",
                      textDecoration: "underline",
                    }}
                    title={userItem.username}
                    onClick={() => navigate(`/profile/${userItem.username}`)}
                  >
                    {userItem.username}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#555",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={userItem.email}
                  >
                    {userItem.email}
                  </div>
                </div>

                {/* Bouton Follow */}
                <button
                  onClick={() => handleClick(userItem)}
                  disabled={followedUsers.includes(userItem._id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 4,
                    border: "none",
                    backgroundColor: "#1976d2",
                    color: "white",
                    cursor: followedUsers.includes(userItem._id)
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: "bold",
                    userSelect: "none",
                    opacity: followedUsers.includes(userItem._id) ? 0.6 : 1,
                  }}
                  title={followedUsers.includes(userItem._id) ? "Déjà suivi" : "Suivre"}
                >
                  Follow
                </button>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: "center", color: "#777" }}>
            Aucun utilisateur trouvé
          </div>
        )}
      </div>
    </div>
  );
}
