import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { pageStatusService } from '../../services/pageStatusService.js';

export const PageStatusContext = createContext(null);

export function PageStatusProvider({ children }) {
  const [statuses, setStatuses] = useState(() => pageStatusService.getAllStatuses());
  const [adminBypass, setAdminBypass] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('avi_admin_maintenance_bypass') === 'true';
    }
    return false;
  });

  // Đồng bộ với localStorage khi có thay đổi từ tab khác (storage event)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'avi_page_statuses_v1') {
        setStatuses(pageStatusService.getAllStatuses());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updatePageStatus = useCallback((id, partialConfig, adminName) => {
    const updated = pageStatusService.updatePageStatus(id, partialConfig, adminName);
    setStatuses(pageStatusService.getAllStatuses());
    return updated;
  }, []);

  const setBulkStatus = useCallback((newStatus, adminName) => {
    const updated = pageStatusService.setBulkStatus(newStatus, adminName);
    setStatuses(updated);
    return updated;
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaults = pageStatusService.resetToDefaults();
    setStatuses(defaults);
    return defaults;
  }, []);

  const getPageStatus = useCallback((path) => {
    return pageStatusService.getByPath(path);
  }, [statuses]);

  const toggleAdminBypass = useCallback(() => {
    setAdminBypass((prev) => {
      const next = !prev;
      localStorage.setItem('avi_admin_maintenance_bypass', next ? 'true' : 'false');
      return next;
    });
  }, []);

  const value = {
    statuses,
    getPageStatus,
    updatePageStatus,
    setBulkStatus,
    resetToDefaults,
    adminBypass,
    toggleAdminBypass,
  };

  return (
    <PageStatusContext.Provider value={value}>
      {children}
    </PageStatusContext.Provider>
  );
}

export function usePageStatus() {
  const context = useContext(PageStatusContext);
  if (!context) {
    throw new Error('usePageStatus must be used within a PageStatusProvider');
  }
  return context;
}
