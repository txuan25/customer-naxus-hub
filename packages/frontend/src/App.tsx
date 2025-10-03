import {
  Refine,
  Authenticated,
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  AuthPage,
  ErrorComponent,
  useNotificationProvider,
  ThemedLayout,
  ThemedSider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import { App as AntdApp } from "antd";
import {
  TeamOutlined,
  CustomerServiceOutlined,
  SendOutlined,
  AppstoreOutlined
} from "@ant-design/icons";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { Header } from "./components/header";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { ForgotPassword } from "./pages/forgotPassword";
import { authProvider } from "./authProvider";
import { authProviderMock } from "./authProvider.mock";
import { dataProvider } from "./dataProvider";
import { dataProviderMock } from "./dataProvider.mock";
import { UserRole } from "./types";

// Environment-based provider selection
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const selectedDataProvider = USE_MOCK_DATA ? dataProviderMock : dataProvider;
const selectedAuthProvider = USE_MOCK_DATA ? authProviderMock : authProvider;

console.log(`🔧 Running in ${USE_MOCK_DATA ? 'MOCK' : 'REAL'} data mode`);

// Dashboard Components
const CSODashboard = () => <div>CSO Dashboard - Coming Soon</div>;
const ManagerDashboard = () => <div>Manager Dashboard - Coming Soon</div>;

// Customer Management Components
import { CustomerList } from './pages/customers/list';
import { CustomerCreate } from './pages/customers/create';
import { CustomerEdit } from './pages/customers/edit';
import { CustomerShow } from './pages/customers/show';

// Inquiry Management Components
import { InquiryList } from './pages/inquiries/list';
import { InquiryShow } from './pages/inquiries/show';

// Response Management Components
import { ResponseList } from './pages/responses/list';
import { ResponseCreate } from './pages/responses/create';
import { ResponseEdit } from './pages/responses/edit';
import { ResponseShow } from './pages/responses/show';

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={selectedDataProvider}
                notificationProvider={useNotificationProvider}
                routerProvider={routerProvider}
                authProvider={selectedAuthProvider}
                resources={[
                  {
                    name: "customers",
                    list: "/customers",
                    create: "/customers/create",
                    edit: "/customers/edit/:id",
                    show: "/customers/show/:id",
                    meta: {
                      canDelete: true,
                      label: "Customers",
                      icon: <TeamOutlined />,
                    },
                  },
                  {
                    name: "inquiries",
                    list: "/inquiries",
                    show: "/inquiries/show/:id",
                    meta: {
                      label: "Inquiries",
                      icon: <CustomerServiceOutlined />,
                    },
                  },
                  {
                    name: "responses",
                    list: "/responses",
                    create: "/responses/create",
                    edit: "/responses/edit/:id",
                    show: "/responses/show/:id",
                    meta: {
                      label: "Responses",
                      icon: <SendOutlined />,
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "i4hdjU-H2qu9w-I3pDdz",
                  title: { text: "Nexus Hub", icon: <AppstoreOutlined /> },
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayout
                          Header={() => <Header sticky />}
                          Sider={(props) => <ThemedSider {...props} fixed />}
                        >
                          <Outlet />
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    {/* Dashboard Routes */}
                    <Route index element={<NavigateToResource resource="customers" />} />
                    <Route path="/dashboard/cso" element={<CSODashboard />} />
                    <Route path="/dashboard/manager" element={<ManagerDashboard />} />

                    {/* Customer Management Routes */}
                    <Route path="/customers" element={<CustomerList />} />
                    <Route path="/customers/create" element={<CustomerCreate />} />
                    <Route path="/customers/edit/:id" element={<CustomerEdit />} />
                    <Route path="/customers/show/:id" element={<CustomerShow />} />

                    {/* Inquiry Management Routes */}
                    <Route path="/inquiries" element={<InquiryList />} />
                    <Route path="/inquiries/show/:id" element={<InquiryShow />} />

                    {/* Response Management Routes */}
                    <Route path="/responses" element={<ResponseList />} />
                    <Route path="/responses/create" element={<ResponseCreate />} />
                    <Route path="/responses/edit/:id" element={<ResponseEdit />} />
                    <Route path="/responses/show/:id" element={<ResponseShow />} />
                  </Route>

                  {/* Auth Routes */}
                  <Route
                    element={
                      <Authenticated key="authenticated-outer" fallback={<Outlet />}>
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                  </Route>

                  {/* Error Routes */}
                  <Route path="*" element={<ErrorComponent />} />
                </Routes>
                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
