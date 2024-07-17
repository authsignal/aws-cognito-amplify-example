import { getCurrentUser, signOut } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authsignal } from "./authsignal";

export function Home() {
  const [userId, setUserId] = useState<string | undefined>();
  const [username, setUsername] = useState<string | undefined>();

  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setUserId(user.userId);
        setUsername(user.username);
      })
      .catch((ex) => {
        console.error(ex);

        navigate("/sign-in");
      });
  }, [navigate]);

  if (!userId) {
    return null;
  }

  return (
    <main>
      <section>
        <h1>My Example App</h1>
        <div>Cognito userId: {userId}</div>
        <div>Cognito username: {username}</div>
        <button
          onClick={() => {
            signOut();

            navigate("/sign-in");
          }}
        >
          Sign out
        </button>
      </section>
    </main>
  );
}
