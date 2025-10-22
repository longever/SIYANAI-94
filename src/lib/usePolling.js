
import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * 通用轮询 Hook
 * @param {Function} callback - 轮询执行的回调函数，返回 Promise
 * @param {number} interval - 轮询间隔时间（毫秒），默认 30 秒
 * @param {boolean} shouldPoll - 是否启用轮询，默认 true
 * @param {Array} dependencies - 依赖数组，用于重置轮询
 * @param {Object} options - 配置选项
 * @param {boolean} options.immediate - 是否立即执行一次，默认 true
 * @param {number} options.maxRetries - 最大重试次数，默认 3
 * @param {Function} options.onError - 错误处理回调
 * @returns {Object} 轮询控制对象
 */
export function usePolling(
  callback,
  interval = 30000,
  shouldPoll = true,
  dependencies = [],
  options = {}
) {
  const {
    immediate = true,
    maxRetries = 3,
    onError = null
  } = options;

  const intervalRef = useRef(null);
  const retryCountRef = useRef(0);
  const isPollingRef = useRef(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);

  const startPolling = useCallback(async () => {
    if (isPollingRef.current || !shouldPoll) return;

    isPollingRef.current = true;
    setIsPolling(true);
    setError(null);
    retryCountRef.current = 0;

    // 立即执行一次
    if (immediate) {
      try {
        await callback();
      } catch (error) {
        console.error('轮询初始执行失败:', error);
        if (onError) onError(error);
        setError(error);
      }
    }

    intervalRef.current = setInterval(async () => {
      try {
        await callback();
        retryCountRef.current = 0; // 成功后重置重试计数
        setError(null);
      } catch (error) {
        console.error('轮询执行失败:', error);
        setError(error);
        
        if (onError) onError(error);
        
        retryCountRef.current += 1;
        
        // 达到最大重试次数，停止轮询
        if (retryCountRef.current >= maxRetries) {
          console.warn(`轮询达到最大重试次数 ${maxRetries}，停止轮询`);
          stopPolling();
        }
      }
    }, interval);
  }, [callback, interval, shouldPoll, immediate, maxRetries, onError]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPollingRef.current = false;
    setIsPolling(false);
    retryCountRef.current = 0;
  }, []);

  const restartPolling = useCallback(() => {
    stopPolling();
    startPolling();
  }, [startPolling, stopPolling]);

  const pausePolling = useCallback(() => {
    stopPolling();
  }, [stopPolling]);

  const resumePolling = useCallback(() => {
    if (shouldPoll && !isPollingRef.current) {
      startPolling();
    }
  }, [startPolling, shouldPoll]);

  // 监听 shouldPoll 变化
  useEffect(() => {
    if (shouldPoll) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [shouldPoll, startPolling, stopPolling, ...dependencies]);

  return {
    startPolling,
    stopPolling,
    restartPolling,
    pausePolling,
    resumePolling,
    isPolling,
    error
  };
}

/**
 * 带防抖的轮询 Hook
 * 在频繁切换轮询状态时避免重复创建定时器
 */
export function useDebouncedPolling(
  callback,
  interval = 30000,
  shouldPoll = true,
  dependencies = [],
  options = {}
) {
  const debounceRef = useRef(null);
  const [debouncedShouldPoll, setDebouncedShouldPoll] = useState(shouldPoll);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedShouldPoll(shouldPoll);
    }, 100);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [shouldPoll]);

  return usePolling(
    callback,
    interval,
    debouncedShouldPoll,
    dependencies,
    options
  );
}
  