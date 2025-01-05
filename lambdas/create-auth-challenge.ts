import { Authsignal, VerificationMethod } from "@authsignal/node";
import { CreateAuthChallengeTriggerHandler } from "aws-lambda";

const apiSecretKey = process.env.AUTHSIGNAL_SECRET!;
const apiUrl = process.env.AUTHSIGNAL_URL!;

const authsignal = new Authsignal({ apiSecretKey, apiUrl });

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  // Check if a challenge has already been initiated via passkey SDK
  const { challengeId } = await authsignal.getChallenge({
    action: "cognitoAuth",
    userId,
    verificationMethod: VerificationMethod.PASSKEY,
  });

  const { url } = await authsignal.track({
    action: "cognitoAuth",
    userId,
    attributes: { 
        email,
        challengeId,
    },
  });

  event.response.publicChallengeParameters = { url };

  return event;
};
