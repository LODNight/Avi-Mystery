import { useState, useCallback } from 'react';

/**
 * useAsync — quản lý trạng thái bất đồng bộ một cách nhất quán.
 *
 * @returns {{ loading, data, error, execute, reset }}
 *
 * Cách dùng:
 *   const { loading, data, error, execute } = useAsync();
 *   useEffect(() => { execute(() => courseService.getCourses()); }, []);
 */
export function useAsync() {
  const [state, setState] = useState({
    loading: false,
    data: null,
    error: null,
  });

  const execute = useCallback(async (asyncFn) => {
    setState({ loading: true, data: null, error: null });
    try {
      const result = await asyncFn();
      // result shape: { data, error }
      if (result?.error) {
        setState({ loading: false, data: null, error: result.error });
      } else {
        setState({ loading: false, data: result?.data ?? result, error: null });
      }
      return result;
    } catch (err) {
      const msg = err?.message ?? 'Đã xảy ra lỗi không xác định.';
      setState({ loading: false, data: null, error: msg });
      return { data: null, error: msg };
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, data: null, error: null });
  }, []);

  return { ...state, execute, reset };
}
