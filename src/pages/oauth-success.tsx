// /pages/oauth-success.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function OAuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    const { token } = router.query;

    if (token && typeof token === 'string') {
      localStorage.setItem("token", token);
      router.replace("/user/dashboard");
    }
  }, [router]);

  return <p>Logging you in...</p>;
}