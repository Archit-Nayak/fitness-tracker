import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./components/Login";
import CalorieTracker from "./components/CalorieTracker";
import Register from "./components/Register";

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* 1. The Redirector: Sends users to the right place based on auth */}
        <Route
          path="/"
          element={user ? <Navigate to="/tracker" /> : <Navigate to="/login" />}
        />

        {/* 2. THE MISSING PIECE: Explicit Login Route */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/tracker" />}
        />

        {/* 3. Protected Tracker Route */}
        <Route
          path="/tracker"
          element={user ? <CalorieTracker /> : <Navigate to="/login" />}
        />

        {/* 4. Register Route */}
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/tracker" />}
        />

        {/* 5. Safety Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
