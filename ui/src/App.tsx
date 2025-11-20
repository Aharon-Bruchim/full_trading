import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { router } from "./router";
import { useToast } from "./hooks/useToast";
import { ToastContainer } from "./components/ui/Toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { Loading } from "./components/ui/Loading";
import "./i18n";
import "./styles/ag-grid-custom.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

const AppContent = () => {
  const { toasts, removeToast } = useToast();
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
