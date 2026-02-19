import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "../../lib/authContext";
import type { StoredUser, UserRole } from "../../lib/authContext";
import { Users, Trash2, Edit2, Save, X } from "lucide-react";

export function UserManagement() {
    const { user, getAllUsers, updateUser, deleteUser, createUser } = useAuth();
    const [users, setUsers] = useState<StoredUser[]>(() => getAllUsers());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<StoredUser>>({});
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUser, setNewUser] = useState({
        email: "",
        name: "",
        password: "",
        role: "user" as UserRole,
    });

    const handleEdit = (user: StoredUser) => {
        setEditingId(user.id);
        setEditData(user);
    };

    const handleSave = () => {
        if (editingId && editData) {
            updateUser(editingId, editData);
            const updated = getAllUsers();
            setUsers(updated);
            setEditingId(null);
            setEditData({});
        }
    };

    const handleDelete = (userId: string) => {
        if (confirm("Are you sure you want to delete this user?")) {
            deleteUser(userId);
            const updated = getAllUsers();
            setUsers(updated);
        }
    };

    const handleCreateUser = () => {
        if (!newUser.email || !newUser.name || !newUser.password) {
            alert("Please fill in all fields");
            return;
        }
        createUser({
            email: newUser.email,
            name: newUser.name,
            password: newUser.password,
            role: newUser.role,
        });
        const updated = getAllUsers();
        setUsers(updated);
        setNewUser({ email: "", name: "", password: "", role: "user" });
        setShowCreateForm(false);
    };

    // Only allow admins to access this page
    if (user?.role !== "admin") {
        return (
            <div className="space-y-6">
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h2 className="text-lg font-semibold text-yellow-900">Access Denied</h2>
                    <p className="text-yellow-800">Only administrators can manage users.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-8 h-8" />
                    User Management
                </h1>
                <p className="text-gray-600 mt-1">Manage application users and their roles</p>
            </div>

            {/* Create User Form */}
            {showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New User</CardTitle>
                        <CardDescription>Add a new user to the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="new-name">Name</Label>
                                <Input
                                    id="new-name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="User Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-email">Email</Label>
                                <Input
                                    id="new-email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-role">Role</Label>
                                <select
                                    id="new-role"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="user">User</option>
                                    <option value="maintainer">Maintainer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleCreateUser}>Create User</Button>
                            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>Total users: {users.length}</CardDescription>
                        </div>
                        {!showCreateForm && (
                            <Button onClick={() => setShowCreateForm(true)}>+ Add User</Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Password</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        {editingId === u.id ? (
                                            <>
                                                <td className="py-3 px-4">
                                                    <Input
                                                        value={editData.name || ""}
                                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                        placeholder="Name"
                                                    />
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Input
                                                        type="email"
                                                        value={editData.email || ""}
                                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                        placeholder="Email"
                                                    />
                                                </td>
                                                <td className="py-3 px-4">
                                                    <select
                                                        value={editData.role || "user"}
                                                        onChange={(e) => setEditData({ ...editData, role: e.target.value as UserRole })}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="maintainer">Maintainer</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Input
                                                        type="password"
                                                        value={editData.password || ""}
                                                        onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                                        placeholder="Password"
                                                    />
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={handleSave}>
                                                            <Save className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-3 px-4 text-sm text-gray-900">{u.name}</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">{u.email}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === "admin"
                                                            ? "bg-red-100 text-red-800"
                                                            : u.role === "maintainer"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-blue-100 text-blue-800"
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{u.password}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => handleEdit(u)}>
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" onClick={() => handleDelete(u.id)} className="text-red-600 hover:bg-red-50">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
