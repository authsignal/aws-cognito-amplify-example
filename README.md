# Authsignal + AWS Cognito Amplify Example

This example shows how to integrate [Authsignal](https://docs.authsignal.com) with [AWS Cognito](https://aws.amazon.com/cognito/) in a simple React web app.

If you're looking for a similar example but for React Native, you can find one [here](https://github.com/authsignal/react-native-passkey-example/tree/with-aws-cognito).

## Installation

```
yarn install
```

## Configuration

Rename the example env config file from `.env.example` to `.env` then update it with values for your Authsignal tenant and Cognito user pool.

## The AWS lambda triggers

This example repo contains [four lambdas](https://github.com/authsignal/aws-cognito-amplify-example/tree/main/lambdas) which can be deployed to your AWS environment.

Once deployed, these lambdas can be connected to your Cognito user pool:

![AWS Cognito triggers!](/cognito-triggers.png "AWS Cognito triggers")

### Create auth challenge lambda

This lambda uses the [Authsignal Node.js SDK](https://docs.authsignal.com/sdks/server/node) to return a short-lived token back to the app which can be passed to the [Authsignal Web SDK](https://docs.authsignal.com/sdks/client/web) to launch the Authsignal pre-built UI in a popup:

```ts
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
```

### Verify auth challenge response lambda

This lambda takes the result token returned by the [Authsignal Web SDK](https://docs.authsignal.com/sdks/client/browser-sdk) and passes it to the [Authsignal Node.js SDK](https://docs.authsignal.com/sdks/server/node) to validate the result of the challenge:

```ts
export const handler: VerifyAuthChallengeResponseTriggerHandler = async (
  event
) => {
  const userId = event.request.userAttributes.sub;
  const token = event.request.challengeAnswer;

  const { state } = await authsignal.validateChallenge({ userId, token });

  event.response.answerCorrect = state === "CHALLENGE_SUCCEEDED";

  return event;
};
```

### Define auth challenge and pre sign up lambdas

These lambdas don't have any interesting interaction with Authsignal but are required to get things working end-to-end. You can find out more info about what they do in [this AWS blog post](https://aws.amazon.com/blogs/mobile/implementing-passwordless-email-authentication-with-amazon-cognito/).

## The React web app

### Running the app

Run the app with the following command:

```
yarn dev
```

### Sign up

The example app only has a "Sign in" page - as part of this flow we try to create the user in Cognito first and if they already exist we simply ignore the error and continue.

```ts
try {
  const signUpInput = {
    username: email,
    password: Math.random().toString(36).slice(-16) + "X", // Dummy value - never used
    attributes: {
      email,
    },
  };

  await Auth.signUp(signUpInput);
} catch (ex) {
  if (ex instanceof Error && ex.name !== "UsernameExistsException") {
    throw ex;
  }
}
```

Similar to the example in [this AWS blog post](https://aws.amazon.com/blogs/mobile/implementing-passwordless-email-authentication-with-amazon-cognito/), a dummy password is randomly generated because Amplify requires one when signing up, but it won't actually be used.

### Sign in

We call the Amplify `signIn` method, which invokes the [Create Auth Challenge lambda](#create-auth-challenge-lambda) and returns a URL for the pre-built UI.
We pass this URL to the Authsignal Web SDK, which opens it in a popup or modal to present the challenge.
Once the user has completed the challenge, the Authsignal Web SDK returns a token.
We pass this token back to the Amplify `confirmSignIn` method, which invokes the [Verify Auth Challenge Response lambda](#verify-auth-challenge-response-lambda).

```ts
cognitoUser = await Auth.signIn(email);

const { url } = cognitoUser.challengeParam;

const { token } = await authsignal.launch(url, { mode: "popup" });

await Auth.sendCustomChallengeAnswer(cognitoUser, token);
```
