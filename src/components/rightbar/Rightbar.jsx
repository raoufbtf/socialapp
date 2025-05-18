import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Add, Remove } from "@mui/icons-material";
import "./rightbar.css";

// Modal d'édition des infos utilisateur
function ModalEdit({ initialData, onClose, onSave, currentUser, userId, dispatch }) {
  const [localUser, setLocalUser] = useState(initialData);

  useEffect(() => {
    setLocalUser(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalUser((prev) => ({
      ...prev,
      [name]: name === "relationship" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8800/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localUser),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      const updatedUser = { ...currentUser, ...localUser };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch({ type: "UPDATE_USER", payload: updatedUser });
      onSave(updatedUser);
    } catch (err) {
      console.error("Erreur :", err);
    }
    onClose();
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h3>Modifier les informations</h3>
        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label>Ville</label>
            <input type="text" name="city" value={localUser.city} onChange={handleChange} />
          </div>
          <div className="formGroup">
            <label>Provenance</label>
            <input type="text" name="from" value={localUser.from} onChange={handleChange} />
          </div>
          <div className="formGroup">
            <label>Relation</label>
            <select name="relationship" value={localUser.relationship} onChange={handleChange}>
              <option value={0}>Non précisé</option>
              <option value={1}>Célibataire</option>
              <option value={2}>Marié(e)</option>
            </select>
          </div>
          <div className="modalButtons">
            <button type="submit" className="saveButton">Enregistrer</button>
            <button type="button" onClick={onClose} className="cancelButton">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Rightbar({ user }) {
  const PF = "http://localhost:8800/api/public/images/";
  const [friends, setFriends] = useState([]);
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [followed, setFollowed] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editableUser, setEditableUser] = useState({ city: "", from: "", relationship: 0 });

  useEffect(() => {
    if (user?._id && user.followers) {
      setFollowed(user.followers.includes(currentUser._id));
    }
  }, [user, currentUser._id]);

  useEffect(() => {
    if (user) {
      setEditableUser({
        city: user.city || "",
        from: user.from || "",
        relationship: user.relationship || 0,
      });
    }
  }, [user]);

  useEffect(() => {
    const getFriends = async () => {
      const targetId = user?._id || currentUser._id;
      if (!targetId) return;

      try {
        const res = await axios.get(`http://localhost:8800/api/users/friends/${targetId}`);
        setFriends(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des amis :", err);
      }
    };
    getFriends();
  }, [user, currentUser]);

  const handleClick = async () => {
    if (!user?._id || !currentUser?._id) return;

    try {
      if (followed) {
        await axios.put(`http://localhost:8800/api/users/${user._id}/unfollow`, {
          userId: currentUser._id,
        });
        user.followers = user.followers.filter((id) => id !== currentUser._id);
        setFollowed(false);
        dispatch({ type: "UNFOLLOW", payload: user._id });
      } else {
        await axios.put(`http://localhost:8800/api/users/${user._id}/follow`, {
          userId: currentUser._id,
        });
        user.followers.push(currentUser._id);
        setFollowed(true);
        dispatch({ type: "FOLLOW", payload: user._id });
      }
    } catch (err) {
      console.error("Erreur lors du (un)follow :", err);
    }
  };

  const handleSaveChanges = async (updatedUser) => {
    try {
      await axios.put(`/users/${currentUser._id}`, updatedUser);
      setEditableUser(updatedUser);
      dispatch({ type: "UPDATE_USER", payload: updatedUser });
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
    }
    setShowEditModal(false);
  };

  const ProfileRightbar = () => (
    <>
      {user?.username !== currentUser?.username && (
        <button className="rightbarFollowButton" onClick={handleClick}>
          {followed ? "Unfollow" : "Follow"}
          {followed ? <Remove /> : <Add />}
        </button>
      )}
      <h4 className="rightbarTitle">Informations utilisateur</h4>
      <div className="rightbarInfo">
        <div className="rightbarInfoItem"><span>Nom :</span> {user.username}</div>
        <div className="rightbarInfoItem"><span>Ville :</span> {editableUser.city || "-/-"}</div>
        <div className="rightbarInfoItem"><span>Provenance :</span> {editableUser.from || "-/-"}</div>
        <div className="rightbarInfoItem">
          <span>Relation :</span>{" "}
          {editableUser.relationship === 1
            ? "Célibataire"
            : editableUser.relationship === 2
            ? "Marié(e)"
            : "Non précisé"}
        </div>
        {user.username === currentUser.username && (
          <button className="rightbarEditButton" onClick={() => setShowEditModal(true)}>
            Modifier les informations
          </button>
        )}
      </div>

      <h4 className="rightbarTitle">Amis</h4>
      <div className="rightbarFollowings">
        {friends.map((friend) => (
          <Link key={friend._id} to={`/profile/${friend.username}`} style={{ textDecoration: "none" }}>
            <div className="rightbarFollowing">
              <img
                src={friend.profilePicture ? PF + friend.profilePicture : PF + "mpp.jpeg"}
                alt={friend.username}
                className="rightbarFollowingImg"
              />
              <span>{friend.username}</span>
            </div>
          </Link>
        ))}
      </div>

      {showEditModal && (
        <ModalEdit
          initialData={editableUser}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveChanges}
          currentUser={currentUser}
          userId={user._id}
          dispatch={dispatch}
        />
      )}
    </>
  );

  const HomeRightbar = () => {
    const handleUnfollow = async (friendId) => {
      if (!currentUser?._id || !friendId) return;
  
      try {
        await axios.put(`http://localhost:8800/api/users/${friendId}/unfollow`, {
          userId: currentUser._id,
        });
  
        setFriends((prev) => prev.filter((f) => f._id !== friendId));
        dispatch({ type: "UNFOLLOW", payload: friendId });
      } catch (err) {
        console.error("Erreur lors du unfollow :", err);
        alert("Erreur lors de la mise à jour. Veuillez réessayer.");
      }
    };
  
    return (
      <>
        <div className="birthdayContainer">
          <img className="birthdayImg" src={PF + "gift.png"} alt="Anniversaire" />
          <span className="birthdayText">
            <b>Pola Foster</b> et <b>3 autres amis</b> ont leur anniversaire aujourd'hui.
          </span>
        </div>
  
        <img className="rightbarAd" src={PF + "ad.jpg"} alt="Publicité" />
  
        <h4 className="rightbarTitle">Amis en ligne</h4>
        <ul className="rightbarFriendList">
          {friends.map((friend) => (
            <li className="rightbarFriend" key={friend._id}>
              <div className="rightbarProfileImgContainer">
                <img
                  className="rightbarProfileImg"
                  src={friend.profilePicture ? PF + friend.profilePicture : PF + "mpp.jpeg"}
                  alt={friend.username}
                />
                <span className="rightbarOnline" />
              </div>
              <div className="rightbarInfo1">
                <span className="rightbarUsername">{friend.username}</span>
                <button
                  className="unfollowBtn"
                  onClick={() => handleUnfollow(friend._id)}
                >
                  Unfollow
                </button>
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  };
  
  

  return (
    <div className="rightbar">
      <div className="rightbarWrapper">{user ? <ProfileRightbar /> : <HomeRightbar />}</div>
    </div>
  );
}
