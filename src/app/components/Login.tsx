import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Landmark, Lock, AlertCircle, User } from "lucide-react";
import { useAuth } from "../../lib/authContext";

export function Login() {
  const [pfId, setPfId] = useState("");
  const [pfPassword, setPfPassword] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const navigate = useNavigate();
  const { loginWithPfId, login, getAllUsers, user: currentUser } = useAuth();

  const allUsers = getAllUsers();

  // PF ID Login Handler
  const handlePfIdLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pfId || !pfPassword) {
      setError("Please enter both PF ID and password");
      return;
    }

    const result = loginWithPfId(pfId, pfPassword);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Login failed");
    }
  };

  // Email based login handlers
  const handleUserSelect = (email: string) => {
    setSelectedEmail(email);
    setEmailPassword("");
    setError("");
    setShowPasswordInput(true);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedEmail || !emailPassword) {
      setError("Please select a user and enter password");
      return;
    }

    const result = login(selectedEmail, emailPassword);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Login failed");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ATM Connect</h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              {currentUser
                ? `Logged in as ${currentUser.name} (${currentUser.role})`
                : "Choose your login method"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentUser ? (
              // If already logged in, show logout option
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full"
                  size="lg"
                >
                  Continue to Dashboard
                </Button>
                <Button
                  onClick={() => {
                    localStorage.removeItem("authUser");
                    localStorage.removeItem("isAuthenticated");
                    window.location.reload();
                  }}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="pfid" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pfid">PF ID Login</TabsTrigger>
                  <TabsTrigger value="email">Email Login</TabsTrigger>
                </TabsList>

                {/* PF ID Login Tab */}
                <TabsContent value="pfid" className="space-y-4 mt-4">
                  <form onSubmit={handlePfIdLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pfid">PF ID / Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="pfid"
                          type="text"
                          placeholder="e.g., PF001, ADMIN001"
                          value={pfId}
                          onChange={(e) => setPfId(e.target.value.toUpperCase())}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-pfid">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="password-pfid"
                          type="password"
                          placeholder="••••••••"
                          value={pfPassword}
                          onChange={(e) => setPfPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md flex gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full" size="lg">
                      Sign In
                    </Button>
                  </form>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700">
                    <p className="font-medium mb-1">Demo PF IDs:</p>
                    <p>• Admin: ADMIN001 / admin@12345</p>
                    <p>• User: PF001 / defpass</p>
                    <p>• Maintainer: PF003 / defpass</p>
                  </div>
                </TabsContent>

                {/* Email Login Tab */}
                <TabsContent value="email" className="space-y-4 mt-4">
                  {!showPasswordInput ? (
                    <div className="space-y-3">
                      <Label>Select User</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {allUsers.map((user) => (
                          <button
                            key={user.email}
                            onClick={() => handleUserSelect(user.email)}
                            className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-600">{user.pfId}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-medium capitalize ${user.role === "admin" ? "bg-red-100 text-red-700" :
                                  user.role === "maintainer" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-blue-100 text-blue-700"
                                }`}>
                                {user.role}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-600">Selected User:</p>
                        <p className="font-medium text-gray-900">{allUsers.find(u => u.email === selectedEmail)?.name}</p>
                        <p className="text-xs text-gray-500">{allUsers.find(u => u.email === selectedEmail)?.pfId}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEmail("");
                            setEmailPassword("");
                            setShowPasswordInput(false);
                            setError("");
                          }}
                          className="mt-2 text-blue-600"
                        >
                          Change User
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password-email">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="password-email"
                            type="password"
                            placeholder="••••••••"
                            value={emailPassword}
                            onChange={(e) => setEmailPassword(e.target.value)}
                            className="pl-10"
                            autoFocus
                            required
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}

                      <Button type="submit" className="w-full" size="lg">
                        Sign In
                      </Button>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
            )}

            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700">
              <p className="font-medium mb-1">About PF ID:</p>
              <p>PF ID uniquely identifies each user</p>
              <p>Role is auto-determined from PF ID mapping</p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 ATM Connect. All rights reserved.
        </p>
      </div>
    </div>
  );
}
