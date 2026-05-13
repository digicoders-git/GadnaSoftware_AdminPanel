import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin')); } catch { return null; }
  });

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('admin', JSON.stringify(data));
    setAdmin(data);
  };

  const updateAdminData = (data) => {
    const updated = { ...admin, ...data };
    localStorage.setItem('admin', JSON.stringify(updated));
    setAdmin(updated);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, updateAdminData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


