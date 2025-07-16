import { router } from "./router/createRouteConfig";
import { useRoutes } from "react-router-dom";

const App = function () {
  const elements = useRoutes(router);
  return elements;
};

export default App;
