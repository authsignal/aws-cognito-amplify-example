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
        <input
          id="email"
          type="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
        />
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

              if (
                nextStep.signInStep !== "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE"
              ) {
                return setLoading(false);
              }

              const url = nextStep.additionalInfo!.url;

              const { token } = await authsignal.launch(url, { mode: "popup" });

              await confirmSignIn({ challengeResponse: token! });

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
