import {
  confirmSignIn,
  signIn,
  SignInInput,
  signUp,
  SignUpInput,
} from "aws-amplify/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authsignal } from "./authsignal";

export function SignIn() {
  const [email, setEmail] = useState("");
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
        <button
          onClick={async () => {
            setLoading(true);

            // Create user in Cognito
            // If they already exist then ignore error and continue
            try {
              const signUpInput: SignUpInput = {
                username: email,
                password: Math.random().toString(36).slice(-16) + "X", // Dummy value - never used
                options: {
                  userAttributes: {
                    email,
                  },
                },
              };

              await signUp(signUpInput);
            } catch (ex) {
              setLoading(false);

              if (
                ex instanceof Error &&
                ex.name !== "UsernameExistsException"
              ) {
                throw ex;
              }
            }

            const signInInput: SignInInput = {
              username: email,
              options: {
                authFlowType: "CUSTOM_WITHOUT_SRP",
              },
            };

            const { nextStep } = await signIn(signInInput);

            if (
              nextStep.signInStep !== "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE"
            ) {
              setLoading(false);

              return;
            }

            const url = nextStep.additionalInfo!.url;

            const { token } = await authsignal.launch(url, { mode: "popup" });

            if (!token) {
              setLoading(false);

              return alert("Sign in error");
            }

            await confirmSignIn({ challengeResponse: token });

            setLoading(false);

            navigate("/");
          }}
        >
          {loading ? "Loading..." : "Sign in"}
        </button>
      </section>
    </main>
  );
}
