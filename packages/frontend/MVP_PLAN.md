# Customer Nexus Hub - MVP Frontend Plan

## 🎯 **MVP SCOPE (Theo Technical Assessment PDF)**

### **📋 Simplified Requirements**
- **2 Roles Only**: CSO + Manager (bỏ Admin role)
- **Core Features**: Customer CRUD + Response workflow + Basic dashboard
- **Tech Stack**: React + TypeScript + Refine.dev + Basic UI Components
- **Focus**: Đáp ứng evaluation criteria, không over-engineer

---

## 🎯 **MVP FEATURES**

### **✅ Must Have (Core Requirements)**
1. **Authentication**
   - Login form (email/password)
   - JWT token management
   - Role-based access (CSO/Manager)

2. **Customer Management**
   - Customer list với pagination
   - Create/Edit customer
   - Role-based filtering (CSO chỉ thấy assigned customers)
   - Basic search

3. **Response Workflow**
   - CSO create response to customer inquiry
   - Manager approve/reject response
   - Basic response history

4. **Basic Dashboard**
   - Simple stats (customer count, pending responses)
   - Recent activities list

### **❌ Removed from Original Plan**
- Admin role và user management
- Real-time notifications
- Advanced analytics
- Complex reporting
- Dark/light theme
- Bulk operations
- Data export
- Rich text editor (use simple textarea)
- Response timeline
- Advanced filtering

---

## 🏗️ **SIMPLIFIED COMPONENT LIST**

### **Essential Components Only**
```typescript
// Authentication
<LoginForm />               // Email/password form
<ProtectedRoute />          // Route protection

// Basic UI
<ButtonPrimary />           // Submit actions
<ButtonSecondary />         // Cancel actions
<InputText />               // Text input
<InputEmail />              // Email validation
<InputPassword />           // Password input

// Data Display & Tables
<DataTable />               // Base table với pagination
<CustomerTable />           // Customer list table
<InquiryTable />            // CSO xem customer inquiries/messages
<ResponseTable />           // Response history table
<StatusBadge />             // Simple status indicator

// Forms
<CustomerForm />            // Create/Edit customer
<ResponseForm />            // Create response (simple textarea)

// Layout
<DashboardLayout />         // Basic dashboard
<PageHeader />              // Simple page header
```

---

## 🚀 **SIMPLIFIED PHASES**

### **Phase 1: Environment** ✅ Completed
- UI components structure
- Storybook setup
- TypeScript configuration

### **Phase 2: Essential Components** ✅ Completed  
- Basic buttons và inputs
- DataTable component
- StatusBadge
- Components đã có trong Storybook

### **Phase 3: React App Setup** 🔄 Next
```typescript
// Tasks:
- Setup React app với Refine.dev
- Configure authentication provider
- Setup basic routing (Dashboard, Customers, Responses)
- Connect to backend API
```

### **Phase 4: Authentication** 
```typescript
// MVP Auth:
- Login page với email/password
- JWT token storage
- Redirect based on role (CSO/Manager)
- Logout functionality
```

### **Phase 5: Customer & Inquiry Management**
```typescript
// Customer tables:
- CustomerTable: List customers với pagination
- Role-based filtering (CSO sees assigned only)
- Create/Edit customer forms

// Inquiry tables:
- InquiryTable: CSO xem customer messages/inquiries
- Filter by status, customer, date
- Pagination và basic search
```

### **Phase 6: Response Workflow**
```typescript
// Response management:
- Response creation form (simple textarea)
- ResponseTable: History của responses
- Manager approval interface với pagination
- Approve/Reject buttons
```

### **Phase 7: Testing & Polish**
```typescript
// Quality:
- Component tests
- Integration tests
- Error handling
- Basic documentation
```

---

## 📋 **MVP USE CASES**

### **UC-001: CSO Login**
- CSO login với email/password
- Redirect to CSO dashboard
- See assigned customers only

### **UC-002: Manager Login**
- Manager login với email/password  
- Redirect to Manager dashboard
- See all customers và pending approvals

### **UC-003: Customer Table (Role-based)**
- CSO: CustomerTable chỉ show assigned customers
- Manager: CustomerTable show all customers
- Pagination (10/25/50 per page), basic search
- Columns: Name, Email, Company, Status, Actions

### **UC-004: Inquiry Table (CSO Core Feature)**
- CSO: InquiryTable show messages từ assigned customers
- Filter by: status, customer, date range
- Pagination và search
- Columns: Customer, Subject, Priority, Status, Date, Actions

### **UC-005: Create Customer**
- CustomerForm: firstName, lastName, email, phone, company
- Auto-assign to CSO hoặc manual assign (Manager)

### **UC-006: Create Response**
- CSO click inquiry trong InquiryTable
- ResponseForm với simple textarea (no rich editor)
- Save as draft or submit for approval

### **UC-007: Manager Approval Table**
- Manager: ResponseTable show pending responses
- Pagination và filtering
- Columns: Customer, CSO, Response Preview, Status, Actions
- Approve/Reject actions

### **UC-008: Response History Table**
- ResponseTable show all responses cho customer
- Filter by status, CSO, date
- Pagination


---

## 📊 **TECHNICAL ALIGNMENT**

### **✅ Evaluation Criteria Coverage**
- **Cross-cutting**: Error handling, validation, loading states
- **RBAC**: Role-based routes và data filtering
- **CRUD**: Customer operations với auth verification
- **Pagination**: Basic table pagination
- **TypeScript**: Strict typing throughout
- **Testing**: Component và integration tests

### **✅ Backend Integration**
- Use existing NestJS API endpoints
- JWT authentication
- Role-based data access
- Pagination support

---

## 🎯 **SUCCESS METRICS**

### **MVP Definition of Done**
- [ ] CSO can login và see assigned customers
- [ ] Manager can login và see all customers + approvals
- [ ] Customer CRUD works với role restrictions
- [ ] Response workflow: Create → Approve/Reject
- [ ] Basic pagination trong all tables
- [ ] All evaluation criteria met
- [ ] Tests pass
- [ ] Documentation complete

### **Technical Quality**
- TypeScript strict mode
- Component tests coverage > 80%
- Error handling for API failures
- Loading states for async operations
- Responsive design (basic)

---

## 🚦 **NEXT STEPS**

1. **Continue Phase 3**: Setup React app với Refine.dev
2. **Create subtasks** cho remaining phases
3. **Focus on MVP scope** - không thêm features ngoài requirements
4. **Test thoroughly** để đảm bảo evaluation criteria

**Estimated Timeline**: 2-3 phases nữa để complete MVP

**Key Principle**: Keep it simple, meet requirements, no over-engineering! 🎯