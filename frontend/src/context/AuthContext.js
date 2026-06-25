import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');

    if (token && role && email) {
      setUser({ token, role, email, name });
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    console.log('JWT Token on login:', authData.token);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('role', authData.role);
    localStorage.setItem('email', authData.email);
    localStorage.setItem('name', authData.name);
    setUser({
      token: authData.token,
      role: authData.role,
      email: authData.email,
      name: authData.name,
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isCustomer = () => user?.role === 'CUSTOMER';

  const updateUser = (partialUser) => {
    setUser((prev) => {
      const updated = { ...prev, ...partialUser };
      if (updated.name) localStorage.setItem('name', updated.name);
      // update other fields if necessary
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAdmin, isCustomer, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
