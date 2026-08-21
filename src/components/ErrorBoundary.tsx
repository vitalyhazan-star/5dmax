import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Верхнеуровневый error boundary: сбой одного модуля не роняет всё приложение.
 * Пользователю показывается человекочитаемое сообщение + кнопка перезагрузки.
 *
 * Примечание: в сборке react типизирован через JS-инференс, поэтому внутри
 * классовой границы обращение к props/state идёт через перегрузку this.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  private currentProps(): ErrorBoundaryProps {
    return (this as unknown as { props: ErrorBoundaryProps }).props;
  }

  render() {
    if (this.state.hasError) {
      const props = this.currentProps();
      const fallback = props.fallback;
      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 text-center space-y-4">
            <div className="text-3xl">⚡</div>
            <h1 className="text-xl font-bold font-display text-white">Сбой модуля</h1>
            <p className="text-xs text-neutral-500">
              Раздел временно недоступен. Остальные части приложения продолжают работать.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold cursor-pointer"
            >
              Перезагрузить приложение
            </button>
            {fallback}
          </div>
        </div>
      );
    }
    return this.currentProps().children;
  }
}