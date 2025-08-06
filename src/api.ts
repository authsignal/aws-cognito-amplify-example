import { fetchAuthSession } from "aws-amplify/auth";
import { authsignal } from "./authsignal";

const API_GATEWAY_ID = import.meta.env.VITE_API_GATEWAY_ID!;
const AWS_REGION = import.meta.env.VITE_AWS_REGION!;

const url = `https://${API_GATEWAY_ID}.execute-api.${AWS_REGION}.amazonaws.com`;

export async function addAuthenticator() {
  const accessToken = await getAccessToken();

  const response = await fetch(`${url}/authenticators`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());

  authsignal.setToken(response.token);
}

interface StepUpInput {
  deviceId: string;
}

interface StepUpResponse {
  state: "CHALLENGE_REQUIRED" | "ALLOW";
  url: string;
  token: string;
}

export async function stepUp(input: StepUpInput): Promise<StepUpResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${url}/step-up`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());

  return response;
}

interface CreatePaymentInput {
  token: string;
}

export async function createPayment(input: CreatePaymentInput) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${url}/payments`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    alert("Payment authorized successfully.");
  } else {
    alert("Failed to authorize payment.");
  }
}

async function getAccessToken(): Promise<string> {
  const authSession = await fetchAuthSession();
  const accessToken = authSession.tokens?.accessToken?.toString();

  if (!accessToken) {
    throw new Error("Access token is not available");
  }

  return accessToken;
}
