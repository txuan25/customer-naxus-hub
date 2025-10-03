import { AuthPage } from "@refinedev/antd";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      title="Customer Nexus Hub"
      formProps={{
        initialValues: { email: "cso1@crm.com", password: "password123" },
      }}
      renderContent={(content, title) => (
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5"
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            minWidth: "400px"
          }}>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h1 style={{ color: "#1890ff", margin: 0 }}>Customer Nexus Hub</h1>
              <p style={{ color: "#666", marginTop: "8px" }}>Sign in to continue</p>
            </div>
            {content}
            <div style={{
              marginTop: "20px",
              padding: "15px",
              background: "#f5f5f5",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#666"
            }}>
              <strong>Test Accounts:</strong><br/>
              CSO: cso1@crm.com / password123<br/>
              Manager: manager@crm.com / password123<br/>
              Admin: admin@crm.com / password123
            </div>
          </div>
        </div>
      )}
    />
  );
};
