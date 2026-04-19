"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import API from "@/services/apiClient";

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export default function PermissionsPanel() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 🔒 Guard
  useEffect(() => {
    if (isLoading) return;

    if (!user) router.push("/login");
    if (user?.role !== "admin") router.push("/unauthorized");
  }, [user, isLoading]);

  // Load data
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const loadData = async () => {
      try {
        const [rolesRes, permsRes] = await Promise.all([
          API.get("/admin/roles"),
          API.get("/admin/permissions")
        ]);

        setRoles(rolesRes.data);
        setPermissions(permsRes.data);
      } catch (error) {
        console.error("Failed to load permissions data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handlePermissionToggle = async (roleId: string, permissionId: string, hasPermission: boolean) => {
    try {
      if (hasPermission) {
        await API.delete(`/admin/roles/${roleId}/permissions/${permissionId}`);
      } else {
        await API.post(`/admin/roles/${roleId}/permissions`, { permissionId });
      }

      // Refresh roles
      const rolesRes = await API.get("/admin/roles");
      setRoles(rolesRes.data);
    } catch (error) {
      console.error("Failed to update permission:", error);
    }
  };

  if (isLoading || loading) return <p>Loading...</p>;

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">RBAC Permissions Panel</h1>

      {/* Role Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Role</label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border rounded p-2 w-full max-w-xs"
        >
          <option value="">Choose a role...</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </div>

      {/* Permissions Table */}
      {selectedRoleData && (
        <div className="bg-white shadow rounded">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Permissions for {selectedRoleData.name}</h2>
          </div>

          <div className="p-4">
            <div className="grid gap-4">
              {permissions.map(permission => {
                const hasPermission = selectedRoleData.permissions.some(p => p.id === permission.id);

                return (
                  <div key={permission.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h3 className="font-medium">{permission.name}</h3>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                      <p className="text-xs text-gray-500">{permission.resource}:{permission.action}</p>
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hasPermission}
                        onChange={() => handlePermissionToggle(selectedRoleData.id, permission.id, hasPermission)}
                        className="mr-2"
                      />
                      {hasPermission ? "Granted" : "Denied"}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}