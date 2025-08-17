import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export const withLazyLoading = (Component: any) => {
  return React.lazy(() => import(`./${Component.name}`));
};

export const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = (callback: Function, delay: number) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args: any[]) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

export const useIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, options);
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return observerRef.current;
};

export const useMemoizedSelector = <T>(
  selector: () => T,
  deps: any[]
): T => {
  return useMemo(selector, deps);
};

export const optimizeTablePerformance = {
  pageSize: 20,
  virtual: true,
  shouldComponentUpdate: (prevProps: any, nextProps: any) => {
    return prevProps.dataSource !== nextProps.dataSource ||
           prevProps.loading !== nextProps.loading;
  }
};

export const useSearchOptimization = (searchFunction: Function, delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchFunction(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchFunction]);

  return { searchTerm, handleSearch };
};

export const preloadComponent = (componentPath: string) => {
  return () => import(componentPath);
};

export const useCleanup = (cleanupFunction: () => void) => {
  useEffect(() => {
    return () => {
      cleanupFunction();
    };
  }, [cleanupFunction]);
}; 
