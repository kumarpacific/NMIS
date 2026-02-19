import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = "admin" | "maintainer" | "user";

export interface User {
    id: string;
    pfId: string; // PF ID / Username
    email: string;
    name: string;
    role: UserRole;
}

export interface StoredUser extends User {
    password: string;
}

// Hardcoded admin credential
const ADMIN_USER = {
    id: "admin-001",
    pfId: "ADMIN001",
    email: "admin@admin.com",
    password: "admin@12345",
    name: "Admin",
    role: "admin" as UserRole,
};

// Template users with default password
const DEFAULT_TEMPLATE_USERS: StoredUser[] = [
    {
        id: "user-001",
        pfId: "PF001",
        email: "user1@example.com",
        password: "defpass",
        name: "User One",
        role: "user",
    },
    {
        id: "user-002",
        pfId: "PF002",
        email: "user2@example.com",
        password: "defpass",
        name: "User Two",
        role: "user",
    },
    {
        id: "maintainer-001",
        pfId: "PF003",
        email: "maintainer@example.com",
        password: "defpass",
        name: "Maintainer",
        role: "maintainer",
    },
];

// Initialize users in localStorage on app load
const initializeUsers = () => {
    const existingUsers = localStorage.getItem("allUsers");
    if (!existingUsers) {
        const allUsers: StoredUser[] = [ADMIN_USER, ...DEFAULT_TEMPLATE_USERS];
        localStorage.setItem("allUsers", JSON.stringify(allUsers));
    }
};

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => { success: boolean; message?: string };
    loginWithPfId: (pfId: string, password: string) => { success: boolean; message?: string };
    logout: () => void;
    getAllUsers: () => StoredUser[];
    updateUser: (userId: string, updates: Partial<StoredUser>) => void;
    deleteUser: (userId: string) => void;
    createUser: (user: Omit<StoredUser, "id">) => void;
    switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Initialize users and load current user on mount
    useEffect(() => {
        initializeUsers();
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                // ignore invalid JSON
            }
        }
    }, []);

    const login = (email: string, password: string): { success: boolean; message?: string } => {
        try {
            const allUsersStr = localStorage.getItem("allUsers");
            const allUsers: StoredUser[] = allUsersStr ? JSON.parse(allUsersStr) : [ADMIN_USER, ...DEFAULT_TEMPLATE_USERS];

            const foundUser = allUsers.find((u) => u.email === email && u.password === password);

            if (!foundUser) {
                return { success: false, message: "Invalid email or password" };
            }

            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            localStorage.setItem("authUser", JSON.stringify(userWithoutPassword));
            localStorage.setItem("isAuthenticated", "true");
            return { success: true };
        } catch (e) {
            return { success: false, message: "Login failed" };
        }
    };

    const loginWithPfId = (pfId: string, password: string): { success: boolean; message?: string } => {
        try {
            const allUsersStr = localStorage.getItem("allUsers");
            const allUsers: StoredUser[] = allUsersStr ? JSON.parse(allUsersStr) : [ADMIN_USER, ...DEFAULT_TEMPLATE_USERS];

            const foundUser = allUsers.find((u) => u.pfId === pfId && u.password === password);

            if (!foundUser) {
                return { success: false, message: "Invalid PF ID or password" };
            }

            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            localStorage.setItem("authUser", JSON.stringify(userWithoutPassword));
            localStorage.setItem("isAuthenticated", "true");
            return { success: true };
        } catch (e) {
            return { success: false, message: "Login failed" };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("authUser");
        localStorage.removeItem("isAuthenticated");
    };

    const getAllUsers = (): StoredUser[] => {
        try {
            const allUsersStr = localStorage.getItem("allUsers");
            return allUsersStr ? JSON.parse(allUsersStr) : [ADMIN_USER, ...DEFAULT_TEMPLATE_USERS];
        } catch (e) {
            return [ADMIN_USER, ...DEFAULT_TEMPLATE_USERS];
        }
    };

    const updateUser = (userId: string, updates: Partial<StoredUser>) => {
        try {
            const allUsers = getAllUsers();
            const index = allUsers.findIndex((u) => u.id === userId);
            if (index !== -1) {
                allUsers[index] = { ...allUsers[index], ...updates };
                localStorage.setItem("allUsers", JSON.stringify(allUsers));
                // If updating current user, update auth state too
                if (user?.id === userId) {
                    const { password: _, ...userData } = allUsers[index];
                    setUser(userData);
                    localStorage.setItem("authUser", JSON.stringify(userData));
                }
            }
        } catch (e) {
            // ignore errors
        }
    };

    const deleteUser = (userId: string) => {
        try {
            const allUsers = getAllUsers();
            const filtered = allUsers.filter((u) => u.id !== userId);
            localStorage.setItem("allUsers", JSON.stringify(filtered));
        } catch (e) {
            // ignore errors
        }
    };

    const createUser = (newUser: Omit<StoredUser, "id">) => {
        try {
            const allUsers = getAllUsers();
            const user: StoredUser = {
                ...newUser,
                id: `user-${Date.now()}`,
            };
            allUsers.push(user);
            localStorage.setItem("allUsers", JSON.stringify(allUsers));
        } catch (e) {
            // ignore errors
        }
    };

    const switchRole = (role: UserRole) => {
        if (user) {
            const updatedUser = { ...user, role };
            setUser(updatedUser);
            localStorage.setItem("authUser", JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                loginWithPfId,
                logout,
                getAllUsers,
                updateUser,
                deleteUser,
                createUser,
                switchRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
