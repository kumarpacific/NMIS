import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select } from "@/app/components/ui/select";
import { Bell, Shield, User, Database } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" defaultValue="Admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" defaultValue="User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" defaultValue="admin@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button>Save Changes</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>Manage your password and security preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button>Update Password</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <CardTitle>Notification Settings</CardTitle>
          </div>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email alerts for critical events</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-gray-300" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">Receive text messages for urgent alerts</p>
              </div>
              <input type="checkbox" className="h-5 w-5 rounded border-gray-300" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Desktop Notifications</p>
                <p className="text-sm text-gray-500">Show browser notifications</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-gray-300" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <CardTitle>System Preferences</CardTitle>
          </div>
          <CardDescription>Configure system-wide settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select id="timezone" defaultValue="utc">
                <option value="utc">UTC (GMT+0)</option>
                <option value="est">Eastern Time (GMT-5)</option>
                <option value="pst">Pacific Time (GMT-8)</option>
                <option value="cst">Central Time (GMT-6)</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select id="dateFormat" defaultValue="mdy">
                <option value="mdy">MM/DD/YYYY</option>
                <option value="dmy">DD/MM/YYYY</option>
                <option value="ymd">YYYY-MM-DD</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select id="language" defaultValue="en">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemsPerPage">Items Per Page</Label>
              <Select id="itemsPerPage" defaultValue="10">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button>Save Settings</Button>
            <Button variant="outline">Reset to Default</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
