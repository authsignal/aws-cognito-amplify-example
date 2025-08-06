import { getCurrentUser, signOut } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addAuthenticator, createPayment, stepUp } from "./api";
import { authsignal } from "./authsignal";
import { getOrCreateDeviceId } from "./device";

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

            await authsignal.passkey.signUp({ username });
          }}
        >
          Create passkey
        </button>
        <button
          onClick={async () => {
            const deviceId = getOrCreateDeviceId();

            const response = await stepUp({ deviceId });

            if (response.state === "CHALLENGE_REQUIRED") {
              const challengeResponse = await authsignal.launch(response.url, { mode: "popup" });

              if (challengeResponse.token) {
                await createPayment({ token: challengeResponse.token });
              }
            } else if (response.state === "ALLOW") {
              await createPayment({ token: response.token });
            } else {
              alert("Unexpected error creating payment.");
            }
          }}
        >
          Create payment
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
