import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Home() {
  const [userId, setUserId] = useState<string | undefined>();
  const [username, setUsername] = useState<string | undefined>();

  const navigate = useNavigate();

  useEffect(() => {
    Auth.currentSession()
      .then((session) => {
        const idTokenPayload = session.getIdToken().decodePayload();

        setUserId(idTokenPayload["sub"]);
        setUsername(idTokenPayload["cognito:username"]);
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
            Auth.signOut();

            navigate("/sign-in");
          }}
        >
          Sign out
        </button>
      </section>
    </main>
  );
}
