import { confirmSignIn, signIn, signUp } from "aws-amplify/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authsignal } from "./authsignal";

export function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
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
        <label htmlFor="password">Confirm password</label>
        <input
          id="confirmedPassword"
          type="password"
          name="confirmedPassword"
          onChange={(event) => setConfirmedPassword(event.target.value)}
          required
        />
        <button
          onClick={async () => {
            if (password !== confirmedPassword) {
              alert("Passwords do not match");

              return;
            }

            setLoading(true);

            try {
              await signUp({
                username: email,
                password,
                options: {
                  userAttributes: {
                    email,
                  },
                },
              });

              const { nextStep } = await signIn({
                username: email,
                password,
                options: {
                  authFlowType: "CUSTOM_WITH_SRP",
                },
              });

              if (nextStep.signInStep !== "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE") {
                throw new Error("Unexpected sign-in step");
              }

              const url = nextStep.additionalInfo!.url;

              const { token } = await authsignal.launch(url, { mode: "popup" });

              if (!token) {
                throw new Error("Failed to obtain token");
              }

              await confirmSignIn({ challengeResponse: token! });

              navigate("/");
            } catch (ex) {
              if (ex instanceof Error) {
                alert("Error signing up: " + ex.message);
              }
            }

            setLoading(false);
          }}
        >
          {loading ? "Loading..." : "Sign up"}
        </button>
        <div>
          Already have an account? <a href="/sign-in">Sign in</a>
        </div>
      </section>
    </main>
  );
}
