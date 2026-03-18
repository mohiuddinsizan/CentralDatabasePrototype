import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/books" replace />;

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(form.username, form.password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <Card className="login-card">
        <h1 className="login-title">Books Admin Login</h1>

        <form onSubmit={submitHandler} className="stack">
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
}