import { Authsignal } from "@authsignal/browser";
import { Auth } from "aws-amplify";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const authsignal = new Authsignal({
  tenantId: import.meta.env.VITE_AUTHSIGNAL_TENANT_ID!,
  baseUrl: import.meta.env.VITE_AUTHSIGNAL_URL!,
});

let cognitoUser;

export function SignIn() {
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  return (
    <main>
      <section>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button
          onClick={async () => {
            // Create user in Cognito
            // If they already exist then ignore error and continue
            try {
              const signUpInput = {
                username: email,
                password: Math.random().toString(36).slice(-16) + "X", // Dummy value - never used
                attributes: {
                  email,
                },
              };

              await Auth.signUp(signUpInput);
            } catch (ex) {
              if (
                ex instanceof Error &&
                ex.name !== "UsernameExistsException"
              ) {
                throw ex;
              }
            }

            cognitoUser = await Auth.signIn(email);

            const { url } = cognitoUser.challengeParam;

            const { token } = await authsignal.launch(url, { mode: "popup" });

            if (!token) {
              return alert("Sign in error");
            }

            await Auth.sendCustomChallengeAnswer(cognitoUser, token);

            navigate("/");
          }}
        >
          Sign in
        </button>
      </section>
    </main>
  );
}
