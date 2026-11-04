import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

interface ErrorBoundaryState { failed: boolean; }

class AppErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error("Personal Cosmic Journal failed to render", error.name);
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="message-screen">
          <div className="moon-mark" aria-hidden="true">☾</div>
          <h1>Не удалось открыть приложение</h1>
          <p>Произошла ошибка при построении экрана. Перезагрузи Mini App; если ошибка повторится, пришли скриншот.</p>
          <button className="secondary-button" type="button" onClick={() => window.location.reload()}>Перезагрузить</button>
        </main>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root was not found");
rootElement.dataset.pcjReactStarted = "true";

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppErrorBoundary><App /></AppErrorBoundary>
  </React.StrictMode>
);
