import { Amplify } from "aws-amplify";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./Home.tsx";
import { SignIn } from "./SignIn.tsx";
import "./index.css";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID!,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID!,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "sign-in",
    element: <SignIn />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
