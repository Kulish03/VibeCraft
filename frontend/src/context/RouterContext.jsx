import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  // Parse hash route or default to '/'
  const getHashRoute = () => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/';
  };

  const [currentRoute, setCurrentRoute] = useState(getHashRoute);

  useEffect(() => {
    const handleHashChange = () => {
      const route = getHashRoute();
      setCurrentRoute(route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to) => {
    const target = to.startsWith('/') ? to : `/${to}`;
    window.location.hash = target;
    setCurrentRoute(target);
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export function Link({ to, children, className = '', ...props }) {
  const { navigate, currentRoute } = useRouter();
  const target = to.startsWith('/') ? to : `/${to}`;
  const isActive = currentRoute === target;

  const handleClick = (e) => {
    e.preventDefault();
    navigate(target);
  };

  return (
    <a
      href={`#${target}`}
      onClick={handleClick}
      className={`${className} ${isActive ? 'active' : ''}`.trim()}
      aria-current={isActive ? 'page' : undefined}
      {...props}
    >
      {children}
    </a>
  );
}
