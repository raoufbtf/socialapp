import React, { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

export default function Feed() {
  const { username } = useParams(); // récupère le username dans l'URL
  const { user } = useContext(AuthContext); // utilisateur actuellement connecté
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let res;
        if (username) {
          // Afficher les posts du profil
          res = await axios.get(`http://localhost:8800/api/posts/profile/${username}`);
        } else {
          // Afficher les posts du fil d'actualité ou aléatoires
          res = await axios.get(`http://localhost:8800/api/posts/timeline/${user._id}`);
          // ou si tu veux afficher des posts aléatoires :
          // res = await axios.get(`http://localhost:8800/api/posts/random`);
        }
        setPosts(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des posts :", err);
      }
    };

    fetchPosts();
  }, [username, user._id]);

  return (
    <div className="feed">
      <div className="feedWrapper">
        {/* Si l'utilisateur est sur son propre profil ou sur l'accueil, il peut partager */}
        {(!username || user.username === username) && <Share />}
        {posts.length === 0 ? (
          <p>Aucun post</p>
        ) : (
          posts.map((p) => (
            <Post key={p._id} post={p} currentUser={user} />
          ))
        )}
      </div>
    </div>
  );
}
