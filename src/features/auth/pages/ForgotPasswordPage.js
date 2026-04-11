import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../shared/components/UI/Card";
import { Button } from "../../../shared/components/UI/Button";
import { Input } from "../../../shared/components/UI/Input";
import { FiMail } from "react-icons/fi";
import toast from "react-hot-toast";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API call would go here
      toast.success("Reset link sent to your email!");
      setSubmitted(true);
    } catch (error) {
      toast.error("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <FiMail className="text-green-600 text-2xl" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-4">
            We've sent a password reset link to {email}
          </p>
          <Link to="/login">
            <Button variant="primary">Back to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">
            Enter your email to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<FiMail className="text-gray-400" />}
            required
          />

          <Button type="submit" loading={loading} fullWidth>
            Send Reset Link
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};
