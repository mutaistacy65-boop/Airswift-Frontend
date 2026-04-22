// Clean Auth Helpers
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("🧹 Auth data cleared");
};

// Get current auth state
export const getAuthState = () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    return { user: null, isAuthenticated: false };
  }

  try {
    const user = JSON.parse(userStr);
    return { user, isAuthenticated: true };
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    clearAuth();
    return { user: null, isAuthenticated: false };
  }
};

// Save auth state
export const saveAuthState = (token: string, user: any) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  console.log("💾 Auth state saved");
};

// Debug auth state
export const debugAuthState = () => {
  console.log("🔍 AUTH DEBUG:");
  console.log("TOKEN:", localStorage.getItem("token"));
  console.log("USER:", JSON.parse(localStorage.getItem("user") || "null"));
};