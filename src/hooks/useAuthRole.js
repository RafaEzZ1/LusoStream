import { useAuth } from "@/components/AuthProvider";

export function useAuthRole() {
  const { profile, loading } = useAuth();
  
  return {
    isAdmin: profile?.role === 'admin',
    isUser: !!profile,
    loading
  };
}