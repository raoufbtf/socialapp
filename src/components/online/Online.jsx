import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import "./online.css";

import { AuthContext } from "../../context/AuthContext";

export default function Online({ user, userItem }) {
  const { dispatch } = useContext(AuthContext);
  const PF = "http://localhost:8800/api/public/images/";

  const [isFollowed, setIsFollowed] = useState(false);

  useEffect(() => {
    if (user?.followings?.includes(userItem?._id)) {
      setIsFollowed(true);
    } else {
      setIsFollowed(false);
    }
  }, [user, userItem]);

  const handleUnfollow = async () => {
    if (!user?._id || !userItem?._id) return;

    if (!isFollowed) return;

    try {
      await axios.put(`http://localhost:8800/api/users/${userItem._id}/unfollow`, {
        userId: user._id,
      });

      setIsFollowed(false);
      dispatch && dispatch({ type: "UNFOLLOW", payload: userItem._id });
    } catch (err) {
      console.error("Erreur lors de l'unfollow :", err);
      alert(err.response?.data || "Erreur lors de la mise à jour. Veuillez réessayer.");
    }
  };

  return (
    <li className="rightbarFriend">
      <div className="rightbarProfileImgContainer">
        <img
          className="rightbarProfileImg"
          src={userItem?.profilePicture ? PF + userItem.profilePicture : PF + "mpp.jpeg"}
          alt={userItem?.username || "Profile"}
        />
        <span className="rightbarOnline"></span>
      </div>

      <div className="rightbarInfo">
        <span className="rightbarUsername">{userItem?.username}</span>
        <button className="unfollowBtn" onClick={handleUnfollow}>
          Unfollow
        </button>
      </div>
    </li>
  );
}
