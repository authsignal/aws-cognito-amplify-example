import { confirmSignIn, signIn } from "aws-amplify/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authsignal } from "./authsignal";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  return (
    <main>
      <section>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" onChange={(event) => setEmail(event.target.value)} required />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button
          onClick={async () => {
            setLoading(true);

            try {
              const { nextStep } = await signIn({
                username: email,
                password,
                options: {
                  authFlowType: "CUSTOM_WITH_SRP",
                },
              });

              if (nextStep.signInStep !== "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE") {
                return setLoading(false);
              }

              const { state, token, url } = nextStep.additionalInfo!;

              if (state === "ALLOW") {
                // We already have a token so just validate the user is allowed to bypass MFA
                await confirmSignIn({ challengeResponse: token });
              } else {
                // Launch the pre-built UI to present an MFA challenge
                // We will validate the token returned after the user completes the challenge
                const response = await authsignal.launch(url, { mode: "popup" });

                if (!response.token) {
                  setLoading(false);

                  return alert("Sign in error");
                }

                await confirmSignIn({ challengeResponse: response.token });
              }

              navigate("/");
            } catch (ex) {
              if (ex instanceof Error) {
                alert(ex.message);
              }
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Loading..." : "Sign in"}
        </button>
        <div>
          Don't have an account? <a href="/sign-up">Sign up</a>
        </div>
      </section>
    </main>
  );
}
