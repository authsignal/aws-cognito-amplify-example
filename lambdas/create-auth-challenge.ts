import { Authsignal } from "@authsignal/node";
import { CreateAuthChallengeTriggerHandler } from "aws-lambda";

const secret = process.env.AUTHSIGNAL_SECRET!;
const apiBaseUrl = process.env.AUTHSIGNAL_URL!;

const authsignal = new Authsignal({ secret, apiBaseUrl });

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  const { url } = await authsignal.track({
    action: "cognitoAuth",
    userId,
    email,
  });

  event.response.publicChallengeParameters = { url };

  return event;
};
