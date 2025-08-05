import { fetchAuthSession } from "aws-amplify/auth";
import { authsignal } from "./authsignal";

const API_GATEWAY_ID = import.meta.env.VITE_API_GATEWAY_ID!;
const AWS_REGION = import.meta.env.VITE_AWS_REGION!;

const url = `https://${API_GATEWAY_ID}.execute-api.${AWS_REGION}.amazonaws.com`;

export async function addAuthenticator() {
  const authSession = await fetchAuthSession();
  const accessToken = authSession.tokens?.accessToken?.toString();

  if (!accessToken) {
    throw new Error("Access token is not available");
  }

  const response = await fetch(`${url}/authenticators`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());

  authsignal.setToken(response.authsignalToken);
}
