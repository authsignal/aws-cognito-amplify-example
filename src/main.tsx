import { Amplify } from "aws-amplify";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./Home.tsx";
import { SignIn } from "./SignIn.tsx";
import "./index.css";

Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_AWS_REGION!,
    userPoolId: import.meta.env.VITE_USER_POOL_ID!,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID!,
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
