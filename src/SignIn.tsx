import { confirmSignIn, signIn } from "aws-amplify/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authsignal } from "./authsignal";
import { getDeviceId, getOrCreateDeviceId } from "./device";

export function SignIn() {
  const [rememberDevice, setRememberDevice] = useState(getDeviceId() !== null);
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
        <div id="device">
          <input
            type="checkbox"
            id="rememberDevice"
            name="rememberDevice"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
          />
          <label htmlFor="rememberDevice">Remember this device</label>
        </div>
        <button
          onClick={async () => {
            setLoading(true);

            const options: Record<string, any> = {
              authFlowType: "CUSTOM_WITH_SRP",
            };

            if (rememberDevice) {
              options.clientMetadata = { deviceId: getOrCreateDeviceId() };
            }

            try {
              const { nextStep } = await signIn({
                username: email,
                password,
                options,
              });

              if (nextStep.signInStep !== "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE") {
                throw new Error("Unexpected sign-in step");
              }

              const state = nextStep.additionalInfo!.state;
              const isEnrolled = nextStep.additionalInfo!.isEnrolled === "true";

              if (!isEnrolled || state === "CHALLENGE_REQUIRED") {
                const url = nextStep.additionalInfo!.url;

                const { token } = await authsignal.launch(url, { mode: "popup" });

                if (token) {
                  await confirmSignIn({ challengeResponse: token });

                  navigate("/");
                }
              } else if (state === "ALLOW") {
                const token = nextStep.additionalInfo!.token;

                if (token) {
                  await confirmSignIn({ challengeResponse: token });

                  navigate("/");
                }
              }
            } catch (ex) {
              if (ex instanceof Error) {
                alert("Error signing in: " + ex.message);
              }
            }

            setLoading(false);
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
