// hooks/useAuth.ts - Hook personnalisé pour utiliser AuthContext facilement

import { useAuthContext } from '../context/AuthContext';

// Export du hook personnalisé
export function useAuth() {
  return useAuthContext();
}

// Export par défaut
export default useAuth;