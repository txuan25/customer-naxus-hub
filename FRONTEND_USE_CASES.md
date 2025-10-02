# Customer Nexus Hub - Frontend Use Cases

## 🎯 **USE CASES CHÍNH CỦA HỆ THỐNG CRM**

### **👤 AUTHENTICATION & AUTHORIZATION**

**UC-001: User Login**
- User nhập email/password
- Hệ thống validate credentials
- Return JWT token + user info với role
- Redirect theo role: Admin→Admin Dashboard, Manager→Manager Dashboard, CSO→CSO Dashboard

**UC-002: Role-Based Access Control**
- Admin: Full access tất cả functions
- Manager: Manage team + approve/reject responses
- CSO: Only assigned customers + create responses

### **👥 CUSTOMER MANAGEMENT**

**UC-003: View Customer List (Role-based)**
- Admin/Manager: Xem tất cả customers với pagination/filtering
- CSO: Chỉ xem customers được assign cho mình
- Search by: name, email, company, status
- Filter by: status (active/inactive/prospect), assigned CSO

**UC-004: Create New Customer**
- Tất cả roles có thể create customer
- Form: firstName, lastName, email, phone, company
- Auto assign to current user (CSO) hoặc manual assign (Admin/Manager)
- Validate unique email

**UC-005: Update Customer Info**
- Admin/Manager: Update any customer
- CSO: Only update assigned customers
- Track changes history

**UC-006: Delete Customer (Admin/Manager only)**
- Soft delete để keep data integrity
- Confirm dialog trước khi delete

### **💬 INQUIRY MANAGEMENT**

**UC-007: View Inquiry List**
- List all inquiries related to accessible customers
- Filter by: status, priority, date range, customer
- Sort by: created date, priority, status
- Status: open, in_progress, pending_approval, approved, rejected, closed

**UC-008: View Incoming Inquiries/Feedback**
- Customers tạo inquiries/feedback từ bên ngoài (out of scope - có thể là email, form, etc.)
- CSO xem list inquiries đã được tạo cho assigned customers
- Filter by: status, priority, date range, customer
- CSO không tạo inquiry, chỉ xem và respond

**UC-009: Update Inquiry Status**
- CSO: open → in_progress
- Manager: Any status transitions for team inquiries
- Admin: Any status transitions

### **📝 RESPONSE WORKFLOW**

**UC-010: Create Draft Response to Customer Inquiry**
- CSO xem inquiry từ customer và tạo response
- Rich text editor for response content
- Save as draft (status = "draft")
- Can edit multiple times before submit

**UC-011: Submit Response for Approval**
- CSO submit draft response
- Status: draft → pending_approval
- Notify Manager về pending approval
- CSO không thể edit sau khi submit

**UC-012: Manager Approval Workflow**
- Manager xem list pending responses
- Review response content + customer context
- Action: Approve hoặc Reject với notes
- Approve: status → approved → auto trigger email queue
- Reject: status → rejected, về lại draft cho CSO edit

**UC-013: View Response History**
- Xem all responses của một customer
- Filter by status, date range
- Track approval timeline

### **📊 DASHBOARD & REPORTING**

**UC-014: Role-based Dashboard**

**Admin Dashboard:**
- Total customers, inquiries, responses stats
- Recent activities across all teams
- System overview và settings

**Manager Dashboard:**
- Team performance metrics
- Pending approvals count
- Team's customer stats
- Response time analytics

**CSO Dashboard:**
- My assigned customers count
- My pending inquiries
- My draft responses
- My performance stats

**UC-015: Data Tables với Advanced Features**
- Pagination (10/25/50/100 per page)
- Sorting by any column
- Global search + column-specific filters
- Export data (CSV/Excel)
- Bulk actions where applicable

### **🔔 NOTIFICATIONS & REAL-TIME**

**UC-016: Notification System**
- Manager: New response pending approval
- CSO: Response approved/rejected
- Admin: System alerts
- In-app notifications + email notifications

**UC-017: Real-time Updates**
- Live status updates cho inquiry/response changes
- Live notifications
- Auto-refresh data khi có changes

### **🔒 SECURITY & AUDIT**

**UC-018: Data Security**
- All API calls require JWT authentication
- Role-based data filtering
- Input validation và sanitization
- CORS protection

**UC-019: Audit Trail**
- Track who created/updated what
- Change history cho critical data
- User activity logs

### **📱 RESPONSIVE DESIGN**

**UC-020: Mobile-Friendly Interface**
- Responsive design cho tablet/mobile
- Touch-friendly interactions
- Collapsible sidebar cho mobile
- Simplified forms cho small screens

---

## 🎨 **UI/UX IMPLICATIONS**

### **Core Components Cần Build:**

**Data Components:**
- `RoleBasedTable` - Table với filtering theo role
- `StatusBadge` - Show inquiry/response status với colors
- `PriorityIndicator` - Visual priority levels
- `ApprovalButtons` - Approve/Reject với confirmation
- `CustomerSelector` - Assign customer to CSO
- `RichTextEditor` - For response creation
- `NotificationCenter` - In-app notifications
- `SearchForm` - Advanced search với multiple filters

**Layout Components:**
- `DashboardLayout` - Different layout per role
- `DataTable` - Enhanced table với all features
- `FormLayout` - Consistent form styling
- `ModalForm` - For create/edit actions

### **Component Priority Matrix:**

| Component | Priority | Use Cases | Complexity |
|-----------|----------|-----------|------------|
| Button | High | All forms/actions | Low |
| Input | High | All forms | Medium |
| Table | High | UC-003,007,013,015 | High |
| Form | High | UC-004,008,010 | High |
| StatusBadge | High | UC-007,012,013 | Low |
| Layout | Medium | UC-014 | Medium |
| Navigation | Medium | UC-001,002 | Medium |
| RichTextEditor | Medium | UC-010 | High |
| NotificationCenter | Low | UC-016,017 | High |

### **Development Flow Based on Use Cases:**

1. **Phase 1**: Authentication (UC-001, UC-002)
2. **Phase 2**: Customer Management (UC-003, UC-004, UC-005)
3. **Phase 3**: Inquiry Management (UC-007, UC-008, UC-009)
4. **Phase 4**: Response Workflow (UC-010, UC-011, UC-012)
5. **Phase 5**: Dashboard & Advanced Features (UC-014, UC-015)
6. **Phase 6**: Notifications & Real-time (UC-016, UC-017)

---

## 📋 **FRONTEND REQUIREMENTS CHECKLIST**

### **Must Have (MVP)**
- [ ] Login/Logout functionality
- [ ] Role-based routing và access control
- [ ] Customer CRUD với role restrictions
- [ ] Inquiry listing và creation
- [ ] Response creation và approval workflow
- [ ] Basic dashboard với stats
- [ ] Data tables với pagination

### **Should Have**
- [ ] Advanced search và filtering
- [ ] Real-time notifications
- [ ] Rich text editor cho responses
- [ ] Export functionality
- [ ] Mobile responsive design

### **Could Have**
- [ ] Bulk operations
- [ ] Advanced analytics
- [ ] Dark/light theme
- [ ] Keyboard shortcuts
- [ ] Offline support

### **Won't Have (V1)**
- [ ] User management interface
- [ ] Advanced reporting
- [ ] Multi-language support
- [ ] Email template editor