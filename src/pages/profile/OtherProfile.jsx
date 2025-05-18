// OtherProfile.jsx
import "./profile.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";
import Feed from "../../components/feed/Feed";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function OtherProfile() {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const PF = "http://localhost:8800/api/public/images/";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8800/api/users?username=${username}`);
        setUserData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [username]);

  if (!userData) return <p>Chargement...</p>;

  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <img
                className="profileCoverImg"
                src={
                  userData.coverPicture
                    ? PF + userData.coverPicture
                    : "https://i.postimg.cc/nhXZsppP/photo-2025-05-13-02-48-27.jpg"
                }
                alt="cover"
              />
              <img
                className="profileUserImg"
                src={
                  userData.profilePicture
                    ? PF + userData.profilePicture
                    : PF + "mpp.jpeg"
                }
                alt="profile"
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{userData.username}</h4>
              <span className="profileInfoDesc">{userData.desc}</span>
            </div>
          </div>
          <div className="profileRightBottom">
            <Feed username={userData.username} />
            <Rightbar user={userData} />
          </div>
        </div>
      </div>
    </>
  );
}
