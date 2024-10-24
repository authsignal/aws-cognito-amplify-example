import { Authsignal, UserActionState } from "@authsignal/node";
import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";

const secret = process.env.AUTHSIGNAL_SECRET!;
const apiBaseUrl = process.env.AUTHSIGNAL_URL!;

const authsignal = new Authsignal({ secret, apiBaseUrl });

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const token = event.request.challengeAnswer;

  const { state } = await authsignal.validateChallenge({
    action: "cognitoAuth",
    userId,
    token,
  });

  event.response.answerCorrect = state === UserActionState.CHALLENGE_SUCCEEDED || state === UserActionState.ALLOW;

  return event;
};
