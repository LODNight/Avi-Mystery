import { useState, useCallback } from 'react';

export function useEditingSession() {
  const [session, setSession] = useState({
    status: 'IDLE', // 'IDLE' | 'EDITING'
    activeCell: null,
    originalValue: '',
    draftValue: '',
    validationState: null, // { status: 'invalid', message: 'Lỗi cú pháp' }
  });

  const startEditing = useCallback((cellAddr, originalValue, initialDraftValue = originalValue) => {
    setSession({
      status: 'EDITING',
      activeCell: cellAddr,
      originalValue,
      draftValue: initialDraftValue,
      validationState: null,
    });
  }, []);

  const updateDraft = useCallback((value) => {
    setSession((prev) => ({ ...prev, draftValue: value, validationState: null }));
  }, []);

  const cancelEditing = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      status: 'IDLE',
      draftValue: prev.originalValue, // Revert to original
      validationState: null,
    }));
  }, []);
  
  const endSession = useCallback(() => {
    setSession((prev) => ({ ...prev, status: 'IDLE', validationState: null }));
  }, []);

  const setValidationState = useCallback((state) => {
    setSession((prev) => ({ ...prev, validationState: state }));
  }, []);

  return { session, startEditing, updateDraft, cancelEditing, endSession, setValidationState };
}
