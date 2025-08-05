import { getCurrentUser, signOut } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addAuthenticator } from "./api";
import { authsignal } from "./authsignal";

export function Home() {
  const [username, setUsername] = useState<string | undefined>();

  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setUsername(user.username);
      })
      .catch((ex) => {
        console.error(ex);

        navigate("/sign-in");
      });
  }, [navigate]);

  if (!username) {
    return null;
  }

  return (
    <main>
      <section>
        <h1>My Example App</h1>
        <div>Cognito username: {username}</div>
        <button
          onClick={async () => {
            await addAuthenticator();

            await authsignal.passkey.signUp({ userName: username });
          }}
        >
          Create passkey
        </button>
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
