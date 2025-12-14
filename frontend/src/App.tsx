import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, useApp } from "./context/AppContext";
import { Navigation } from "./components/Navigation";
import { ToastContainer } from "./components/ToastContainer";

// User Pages
import Home from "./pages/User/Home";
import UploadPage from "./pages/User/Upload";
import ProcessPage from "./pages/User/Process";
import ComparePage from "./pages/User/Compare";
import DocumentsPage from "./pages/User/Documents";

// Admin Pages
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component for admin
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdminAuthenticated } = useApp();
  
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

// Admin route handler
const AdminRoute: React.FC = () => {
  const { isAdminAuthenticated } = useApp();
  
  if (isAdminAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <AdminLogin />;
};

// Layout component with navigation
const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>{children}</main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<UserLayout><Home /></UserLayout>} />
      <Route path="/upload" element={<UserLayout><UploadPage /></UserLayout>} />
      <Route path="/process" element={<UserLayout><ProcessPage /></UserLayout>} />
      <Route path="/compare" element={<UserLayout><ComparePage /></UserLayout>} />
      <Route path="/documents" element={<UserLayout><DocumentsPage /></UserLayout>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
