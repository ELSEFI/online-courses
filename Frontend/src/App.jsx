import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./Pages/login";
import { UserLayout } from "./Components/Layout/userLayout";
import { Home } from "./Pages/home";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
