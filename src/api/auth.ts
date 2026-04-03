const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://airswift-backend-pdk2.onrender.com";

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export const registerUser = async (formData: RegisterFormData) => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};
