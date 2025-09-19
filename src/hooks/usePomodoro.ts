import { useCallback, useEffect, useRef, useState } from 'react';
import { type PomodoroState, PomodoroStateSchema } from '@/schemas/pomodoro';
import { safeParseStoredState } from '@/utils/validation';

const STORAGE_KEY = 'pomodoro-state';

// デフォルト設定
const defaultState: PomodoroState = {
  currentSession: null,
  timeBoundSession: null,
  settings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    notificationsEnabled: true,
    wakeLockEnabled: false,
  },
  statistics: {
    completedSessions: 0,
    totalWorkTime: 0,
    streak: 0,
  },
};

export type TimerPhase = 'work' | 'shortBreak' | 'longBreak';

export function usePomodoro() {
  const [state, setState] = useState<PomodoroState>(defaultState);
  const [currentPhase, setCurrentPhase] = useState<TimerPhase>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const intervalRef = useRef<number | null>(null);

  // LocalStorageから状態を復元
  useEffect(() => {
    const savedState = safeParseStoredState(STORAGE_KEY, PomodoroStateSchema);
    if (savedState) {
      setState(savedState);
      setTimeLeft(savedState.settings.workDuration * 60);
    }
  }, []);

  // 状態をLocalStorageに保存
  const saveState = useCallback((newState: PomodoroState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  // タイマーの現在時間を更新
  const updateTimeLeft = useCallback(() => {
    const duration =
      currentPhase === 'work'
        ? state.settings.workDuration
        : currentPhase === 'shortBreak'
          ? state.settings.shortBreakDuration
          : state.settings.longBreakDuration;

    setTimeLeft(duration * 60);
  }, [currentPhase, state.settings]);

  // フェーズ切り替え
  const switchPhase = useCallback(() => {
    if (currentPhase === 'work') {
      const newCompletedCount = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedCount);

      // 統計を更新
      const newState: PomodoroState = {
        ...state,
        statistics: {
          ...state.statistics,
          completedSessions: state.statistics.completedSessions + 1,
          totalWorkTime: state.statistics.totalWorkTime + state.settings.workDuration,
          streak: state.statistics.streak + 1,
        },
      };
      saveState(newState);

      // 4ポモドーロ毎に長い休憩
      const nextPhase: TimerPhase = newCompletedCount % 4 === 0 ? 'longBreak' : 'shortBreak';
      setCurrentPhase(nextPhase);
    } else {
      setCurrentPhase('work');
    }
    setIsRunning(false);
  }, [currentPhase, completedPomodoros, state, saveState]);

  // タイマー開始
  const startTimer = useCallback(() => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          switchPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [switchPhase]);

  // タイマー停止
  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // タイマーリセット
  const resetTimer = useCallback(() => {
    stopTimer();
    setCurrentPhase('work');
    setTimeLeft(state.settings.workDuration * 60);
    setCompletedPomodoros(0);
  }, [state.settings.workDuration, stopTimer]);

  // 設定更新
  const updateSettings = useCallback(
    (newSettings: Partial<PomodoroState['settings']>) => {
      const updatedState = {
        ...state,
        settings: { ...state.settings, ...newSettings },
      };
      saveState(updatedState);

      // アクティブでない場合は時間を更新（新しい設定値を使用）
      if (!isRunning) {
        const newSettings = updatedState.settings;
        const duration =
          currentPhase === 'work'
            ? newSettings.workDuration
            : currentPhase === 'shortBreak'
              ? newSettings.shortBreakDuration
              : newSettings.longBreakDuration;
        setTimeLeft(duration * 60);
      }
    },
    [state, saveState, isRunning, currentPhase]
  );

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // フェーズ変更時に時間を更新
  useEffect(() => {
    if (!isRunning) {
      updateTimeLeft();
    }
  }, [updateTimeLeft, isRunning]);

  // 時間をフォーマット
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // 状態
    timeLeft,
    currentPhase,
    isRunning,
    completedPomodoros,
    settings: state.settings,
    statistics: state.statistics,

    // アクション
    startTimer,
    stopTimer,
    resetTimer,
    updateSettings,

    // ヘルパー
    formatTime: () => formatTime(timeLeft),
    progress: () => {
      const totalDuration =
        currentPhase === 'work'
          ? state.settings.workDuration * 60
          : currentPhase === 'shortBreak'
            ? state.settings.shortBreakDuration * 60
            : state.settings.longBreakDuration * 60;
      return ((totalDuration - timeLeft) / totalDuration) * 100;
    },
  };
}
