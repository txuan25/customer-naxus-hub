import React from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Switch,
  Select
} from 'antd';
import {
  ReloadOutlined
} from '@ant-design/icons';
import {
  useList,
  useNavigation,
  useGetIdentity
} from '@refinedev/core';
import { InquiryTable } from '../../components/Inquiry/InquiryTable';
import { Inquiry, User, UserRole } from '../../types';

const { Title } = Typography;
const { Option } = Select;

export const InquiryList: React.FC = () => {
  const { data: identity } = useGetIdentity<User>();
  const [showOnlyMyInquiries, setShowOnlyMyInquiries] = React.useState(false);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  // Determine if user is a CSO
  const isCso = identity?.role === UserRole.CSO;

  // Status options for the filter
  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Responded", value: "responded" },
    { label: "Closed", value: "closed" },
  ];

  // Dynamic filters based on toggle state and status selection
  const getFilters = () => {
    const filters = [];
    
    if (isCso && showOnlyMyInquiries) {
      filters.push({ field: "assignedToMe", value: "true", operator: "eq" as const });
    }

    if (selectedStatuses.length > 0) {
      filters.push({ field: "status", value: selectedStatuses, operator: "eq" as const });
    }
    
    return filters;
  };

  const filters = getFilters();

  // Debug: Log filters when they change
  React.useEffect(() => {
    console.log('Current filters:', filters);
  }, [filters]);

  const {
    query: { data: inquiryData, isLoading, refetch }
  } = useList({
    resource: 'inquiries',
    filters,
  });

  const inquiries = (inquiryData?.data || []) as Inquiry[];
  const total = inquiryData?.total || 0;

  const handleRefresh = () => {
    refetch();
  };

  const getPageTitle = () => {
    if (isCso) {
      return showOnlyMyInquiries ? 'My Inquiries' : 'All Inquiries';
    }
    return 'All Inquiries';
  };

  const getPageDescription = () => {
    if (isCso) {
      return showOnlyMyInquiries
        ? 'Inquiries assigned to you'
        : 'All customer inquiries in the system';
    }
    return 'Manage all customer inquiries in the system';
  };

  const handleToggleChange = (checked: boolean) => {
    setShowOnlyMyInquiries(checked);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0 }}>
                {getPageTitle()}
              </Title>
              <Typography.Text type="secondary">
                {getPageDescription()}
              </Typography.Text>
            </Space>
          </Col>
          <Col>
            <Space>
              {isCso && (
                <Space>
                  <Typography.Text>My Inquiries Only</Typography.Text>
                  <Switch
                    checked={showOnlyMyInquiries}
                    onChange={handleToggleChange}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                  />
                </Space>
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Filter Controls */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Space align="center">
              <Typography.Text strong>Filters:</Typography.Text>
            </Space>
          </Col>
          <Col>
            <Space align="center">
              <Typography.Text>Status:</Typography.Text>
              <Select
                mode="multiple"
                placeholder="Select status(es)"
                value={selectedStatuses}
                onChange={setSelectedStatuses}
                style={{ minWidth: '200px' }}
                allowClear
              >
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          {(selectedStatuses.length > 0 || (isCso && showOnlyMyInquiries)) && (
            <Col>
              <Button
                type="link"
                onClick={() => {
                  setSelectedStatuses([]);
                  setShowOnlyMyInquiries(false);
                }}
              >
                Clear all filters
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* Inquiry Table */}
      <Card>
        <InquiryTable
          inquiries={inquiries}
          loading={isLoading}
          pagination={{
            current: 1,
            pageSize: 25,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '25', '50', '100'],
          }}
        />
      </Card>
    </div>
  );
};

export default InquiryList;