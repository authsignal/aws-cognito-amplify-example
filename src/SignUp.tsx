import { confirmSignIn, signIn, signUp } from "aws-amplify/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authsignal } from "./authsignal";

export function SignUp() {
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
          {loading ? "Loading..." : "Create account"}
        </button>
        <div>
          Already have an account? <a href="/sign-in">Sign in</a>
        </div>
      </section>
    </main>
  );
}
