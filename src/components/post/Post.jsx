import React, { useEffect, useState } from "react";
import { MoreVert } from "@mui/icons-material";
import { Menu, MenuItem, IconButton } from "@mui/material";
import axios from "axios";
import "./post.css";

export default function Post({ post, currentUser }) {
  const [like, setLike] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const PF = "http://localhost:8800/api/public/images/";

  // Détermine si le post est liké par l'utilisateur
  useEffect(() => {
    setIsLiked(post.likes?.includes(currentUser._id));
  }, [post.likes, currentUser._id]);

  // Récupère les infos de l'utilisateur auteur du post
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8800/api/users?userId=${post.userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement de l'utilisateur :", err);
      }
    };
    fetchUser();
  }, [post.userId]);

  // Gestion du like
  const likeHandler = async () => {
    try {
      await axios.put(`http://localhost:8800/api/posts/${post._id}/like`, { userId: currentUser._id });
      setLike(isLiked ? like - 1 : like + 1);
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Erreur lors du like :", err);
    }
  };

  // Gestion de la suppression
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer ce post ?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8800/api/posts/${post._id}`, {
        data: { userId: currentUser._id },
      });
      window.location.reload(); // Ou déclenche un rafraîchissement ciblé dans la liste des posts
    } catch (err) {
      console.error("Erreur lors de la suppression du post :", err);
    } finally {
      setAnchorEl(null);
    }
  };

  const liked = isLiked
    ? PF + "heart.png"
    : PF + "like.png";

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <img
              className="postProfileImg"
              src={user?.profilePicture ? PF + user.profilePicture : PF + "mpp.jpeg"}
              alt="Profile"
            />
            <span className="postUsername">{user?.username || "Utilisateur"}</span>
            <span className="postDate">{post.date || "il y a un moment"}</span>
          </div>
          <div className="postTopRight">
            {currentUser._id === post.userId && (
              <>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem
                    onClick={handleDelete}
                    style={{ color: "red", fontWeight: "bold" }}
                  >
                    Supprimer
                  </MenuItem>
                </Menu>
              </>
            )}
          </div>
        </div>

        <div className="postCenter">
          {post?.desc && <span className="postText">{post.desc}</span>}
          {post.img && (
            <img
              className="postImg"
              src={PF + post.img}
              alt="Contenu du post"
            />
          )}
        </div>

        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              className="likeIcon"
              src={liked}
              onClick={likeHandler}
              alt="like"
            />
            <span className="postLikeCounter">{like} personnes aiment ça</span>
          </div>
          <div className="postBottomRight">
            <span className="postCommentText">{post.comments || 0} commentaires</span>
          </div>
        </div>
      </div>
    </div>
  );
}
