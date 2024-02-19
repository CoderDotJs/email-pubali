import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthProvider from "./Auth/AuthProvider.jsx";
import Login from "./Login.jsx";
import PrivateRoute from "./Auth/PrivateRoute.jsx";
import AddUser from "./AddUser.jsx";
import Stats from "./Stats.jsx";
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="App container mx-auto">
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<PrivateRoute />}>
                <Route index path="/" element={<App />} />
                <Route path="add-user" element={<AddUser />} />
                <Route path="stats" element={<Stats />} />
              </Route>
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </div>
    </QueryClientProvider>
  </React.StrictMode>
);
