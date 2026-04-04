const API = process.env.NEXT_PUBLIC_API_URL;

console.log("API URL:", API);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://airswift-backend-pdk2.onrender.com";

export default API_BASE_URL;