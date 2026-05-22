import { BrowserRouter, Route, Routes } from "react-router";
import SignUpPages from "./pages/SignUpPages";
import SignInPages from "./pages/SignInPages";
import ChatAppPages from "./pages/ChatAppPages";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/signup" element={<SignUpPages />}></Route>
          <Route path="/signin" element={<SignInPages />}></Route>

          {/* Protected routes */}
          {/* todo: Implement protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ChatAppPages />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;