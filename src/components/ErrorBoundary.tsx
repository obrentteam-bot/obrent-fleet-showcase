import { Component, type ErrorInfo, type ReactNode } from "react";
import { AppErrorState } from "./AppErrorState";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Render error:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return <AppErrorState error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}
