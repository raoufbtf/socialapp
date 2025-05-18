import "./topbar.css";
import { Search, Person, Chat } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Topbar() {
  const PF = "http://localhost:8800/api/public/images/";
  const { user, dispatch } = useContext(AuthContext);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };

  // Fonction pour chercher les utilisateurs
  useEffect(() => {
    if (searchText.trim() === "") {
      setSearchResults([]);
      return;
    }

    const fetchUsers = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:8800/api/users/search?query=${searchText}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Erreur recherche :", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Petite temporisation pour éviter trop d’appels (debounce)
    const debounceTimeout = setTimeout(fetchUsers, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchText]);

  if (!user) {
    return null;
  }

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">Novasocial</span>
        </Link>
      </div>
      <div className="topbarCenter" style={{ position: "relative" }}>
        <div className="searchbar">
          <Search className="searchIcon" />
          <input
            placeholder="Search for friend, post or video"
            className="searchInput"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        {/* Résultats de recherche */}
        {searchText && (
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: 0,
              right: 0,
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              maxHeight: "300px",
              overflowY: "auto",
              zIndex: 1000,
              borderRadius: "4px",
            }}
          >
            {isSearching && <div style={{ padding: "10px" }}>Searching...</div>}
            {!isSearching && searchResults.length === 0 && (
              <div style={{ padding: "10px" }}>No users found</div>
            )}
            {!isSearching &&
              searchResults.map((u) => (
                <Link
                  key={u._id}
                  to={`/profile/${u.username}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 10px",
                    textDecoration: "none",
                    color: "black",
                    borderBottom: "1px solid #eee",
                  }}
                  onClick={() => setSearchText("")} // vider recherche après clic
                >
                  <img
                    src={u.profilePicture ? PF + u.profilePicture : PF + "mpp.jpeg"}
                    alt={u.username}
                    style={{ width: 30, height: 30, borderRadius: "50%", marginRight: 10 }}
                  />
                  <span>{u.username}</span>
                </Link>
              ))}
          </div>
        )}
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          <Link to="/" className="topbarLink">
            Homepage
          </Link>
          <Link to="/" className="topbarLink">
            Timeline
          </Link>
        </div>
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <Person />
            <span className="topbarIconBadge">1</span>
          </div>
          <div className="topbarIconItem">
            <Chat />
            <span className="topbarIconBadge">2</span>
          </div>
          <div
            className="topbarIconItem"
            onClick={handleLogout}
            style={{ cursor: "pointer" }}
          >
            <LogoutIcon />
          </div>
        </div>
        <Link to={`/profile/${user.username}`}>
          <img
            src={user.profilePicture ? PF + user.profilePicture : PF + "mpp.jpeg"}
            alt={`${user.username}'s profile`}
            className="topbarImg"
          />
        </Link>
      </div>
    </div>
  );
}
