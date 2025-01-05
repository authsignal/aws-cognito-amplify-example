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

  async function promptToCreatePasskey() {
    // The Authsignal SDK requires an authenticated user token to create a passkey
    // To keep the demo simple, we use the token returned from the successful pre-built UI login attempt
    // This token is only valid for 10 mins - you can also generate a new one from your backend
    // https://docs.authsignal.com/scenarios/passkeys-client-sdk#creating-a-passkey
    const token = localStorage.getItem("authsignal_token");

    localStorage.removeItem("authsignal_token");

    // True if a passkey has already been created on this device using the Web SDK
    const isPasskeyAvailable = await authsignal.passkey.isAvailableOnDevice();

    if (token && !isPasskeyAvailable) {
      const result = await authsignal.passkey.signUp({ token });

      if (result) {
        alert("Passkey created!");
      }
    }
  }

  useEffect(() => {
    promptToCreatePasskey();
  });

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
