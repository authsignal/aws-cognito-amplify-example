import {
  confirmSignIn,
  signIn,
  SignInInput,
  signUp,
  SignUpInput,
} from "aws-amplify/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


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
              return;
            }

            const url = nextStep.additionalInfo!.url;

            const { token } = await authsignal.launch(url, { mode: "popup" });

            if (!token) {
              return alert("Sign in error");
            }

            await confirmSignIn({ challengeResponse: token });

            navigate("/");
          }}
        >
          Sign in
        </button>
      </section>
    </main>
  );
}
