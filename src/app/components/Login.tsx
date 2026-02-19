import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Landmark, Lock, Mail, AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "../../lib/authContext";

export function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [adminImpersonateRole, setAdminImpersonateRole] = useState<"user" | "maintainer" | null>(null);
  const navigate = useNavigate();
  const { login, getAllUsers, user: currentUser } = useAuth();

  const allUsers = getAllUsers();

  const handleUserSelect = (email: string) => {
    setSelectedEmail(email);
    setPassword("");
    setError("");
    setShowPasswordInput(true);
    setAdminImpersonateRole(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedEmail || !password) {
      setError("Please select a user and enter password");
      return;
    }

    const result = login(selectedEmail, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Login failed");
    }
  };

  const handleAdminImpersonate = (email: string, asRole: "user" | "maintainer") => {
    if (currentUser?.role === "admin") {
      // Admin can impersonate with specific role
      const user = allUsers.find(u => u.email === email);
      if (user) {
        const impersonatedUser = { ...user, role: asRole };
        localStorage.setItem("authUser", JSON.stringify({ id: user.id, email: user.email, name: user.name, role: asRole }));
        localStorage.setItem("isAuthenticated", "true");
        navigate("/dashboard");
      }
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
                ? `Logged in as ${currentUser.name} (${currentUser.role}). Switch user or switch back to Admin.`
                : "Select a user and enter password to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* If already logged in as admin, show impersonation options */}
            {currentUser?.role === "admin" && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-900 mb-3">Admin Mode: Switch Role</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate("/dashboard")}
                    variant="outline"
                    className="w-full justify-start text-amber-700 border-amber-200 hover:bg-amber-100"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Continue as Admin
                  </Button>
                  <Button
                    onClick={() => {
                      const userAccount = allUsers.find(u => u.role === "user");
                      if (userAccount) handleAdminImpersonate(userAccount.email, "user");
                    }}
                    variant="outline"
                    className="w-full justify-start text-blue-700 border-blue-200 hover:bg-blue-100"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    View as User
                  </Button>
                  <Button
                    onClick={() => {
                      const maintainerAccount = allUsers.find(u => u.role === "maintainer");
                      if (maintainerAccount) handleAdminImpersonate(maintainerAccount.email, "maintainer");
                    }}
                    variant="outline"
                    className="w-full justify-start text-orange-700 border-orange-200 hover:bg-orange-100"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    View as Maintainer
                  </Button>
                  <Button
                    onClick={() => {
                      localStorage.removeItem("authUser");
                      localStorage.removeItem("isAuthenticated");
                      window.location.reload();
                    }}
                    variant="outline"
                    className="w-full justify-start text-red-700 border-red-200 hover:bg-red-100"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            )}

            {/* User selection list */}
            {!showPasswordInput ? (
              <div className="space-y-3">
                <Label>Select User</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allUsers.map((user) => (
                    <button
                      key={user.email}
                      onClick={() => handleUserSelect(user.email)}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
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
                {currentUser && (
                  <Button
                    onClick={() => {
                      localStorage.removeItem("authUser");
                      localStorage.removeItem("isAuthenticated");
                      window.location.reload();
                    }}
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Logout Current User
                  </Button>
                )}
              </div>
            ) : (
              /* Password input for selected user */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600">Selected User:</p>
                  <p className="font-medium text-gray-900">{allUsers.find(u => u.email === selectedEmail)?.name}</p>
                  <p className="text-xs text-gray-500">{selectedEmail}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedEmail("");
                      setPassword("");
                      setShowPasswordInput(false);
                      setError("");
                    }}
                    className="mt-2 text-blue-600"
                  >
                    Change User
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700">
              <p className="font-medium mb-1">Quick Access:</p>
              <p>• Admin: admin@admin.com / admin@12345</p>
              <p>• User/Maintainer: any user / defpass</p>
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
