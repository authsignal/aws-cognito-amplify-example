import { confirmSignIn, signIn } from "aws-amplify/auth";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authsignal } from "./authsignal";
import { getIsDeviceTrusted, getIsDeviceTrustedSet, getOrCreateDeviceId, setIsDeviceTrusted } from "./device";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordSignInLoading, setPasswordSignInLoading] = useState(false);
  const [passkeySignInLoading, setPasskeySignInLoading] = useState(false);

  const navigate = useNavigate();

  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleSignInWithPassword = async () => {
    setPasswordSignInLoading(true);

    try {
      const { nextStep } = await signIn({
        username: email,
        password,
        options: {
          authFlowType: "CUSTOM_WITH_SRP",
          clientMetadata: {
            deviceId: getOrCreateDeviceId(),
            isDeviceTrusted: getIsDeviceTrusted() ? "true" : "false",
          },
        },
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

          const isDeviceTrustedSet = getIsDeviceTrustedSet();

          console.log("isDeviceTrustedSet", isDeviceTrustedSet);

          if (!isDeviceTrustedSet && dialogRef.current) {
            dialogRef.current.showModal();
          } else {
            navigate("/");
          }
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

    setPasswordSignInLoading(false);
  };

  const handleSignInWithPasskey = async () => {
    setPasskeySignInLoading(true);

    const { data } = await authsignal.passkey.signIn({ action: "passkeySignIn" });

    if (data && data.token && data.username) {
      await signIn({
        username: data.username,
        options: {
          authFlowType: "CUSTOM_WITHOUT_SRP",
        },
      });

      await confirmSignIn({ challengeResponse: data.token });

      navigate("/");

      setPasskeySignInLoading(false);
    }
  };

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
        <button onClick={handleSignInWithPassword}>{passwordSignInLoading ? "Loading..." : "Sign in"}</button>
        <div className="text-center">or</div>
        <button onClick={handleSignInWithPasskey}>
          {passkeySignInLoading ? "Loading..." : "Sign in with passkey"}
        </button>
        <div>
          Don't have an account? <a href="/sign-up">Sign up</a>
        </div>
      </section>
      <dialog ref={dialogRef}>
        <p>Remember this device?</p>
        <div className="dialog-buttons">
          <button
            onClick={() => {
              setIsDeviceTrusted(false);

              dialogRef.current?.close();

              navigate("/");
            }}
          >
            No
          </button>
          <button
            onClick={() => {
              setIsDeviceTrusted(true);

              dialogRef.current?.close();

              navigate("/");
            }}
          >
            Yes
          </button>
        </div>
      </dialog>
    </main>
  );
}
