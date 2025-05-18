// ProfileRouter.jsx
import { useParams } from "react-router-dom";
import Profile from "./Profile";
import OtherProfile from "./OtherProfile";

export default function ProfileRouter() {
  const { username } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.username === username) {
    return <Profile />;
  } else {
    return <OtherProfile />;
  }
}
