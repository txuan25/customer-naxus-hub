import React from 'react';
import { Table, Space, Input, Select } from 'antd';
import type { TableProps, ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

export interface DataTableProps<T = any> extends Omit<TableProps<T>, 'columns'> {
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  searchPlaceholder?: string;
  filterOptions?: Array<{ text: string; value: string }>;
  filterPlaceholder?: string;
  onSearch?: (value: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: string[];
    onChange?: (page: number, pageSize: number) => void;
  };
  // Enhanced composition props
  tableClassName?: string;
  controlsClassName?: string;
  emptyText?: string;
  showControls?: boolean;
}

export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  searchable = true,
  filterable = false,
  searchPlaceholder = "Search...",
  filterOptions = [
    { text: 'Active', value: 'active' },
    { text: 'Inactive', value: 'inactive' },
    { text: 'Pending', value: 'pending' },
  ],
  filterPlaceholder = "Filter by status",
  onSearch,
  onFilter,
  pagination,
  tableClassName,
  controlsClassName,
  emptyText,
  showControls = true,
  ...props
}: DataTableProps<T>) => {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const defaultPagination = pagination ? {
    ...{
      current: 1,
      pageSize: 25,
      total: data.length,
      showSizeChanger: true,
      pageSizeOptions: ['10', '25', '50', '100'],
      showQuickJumper: true,
      showTotal: (total: number, range: [number, number]) =>
        `${range[0]}-${range[1]} of ${total} items`,
    },
    ...pagination,
  } : false;

  return (
    <div className={`data-table-wrapper ${tableClassName || ''}`}>
      {showControls && (searchable || filterable) && (
        <div className={`table-controls ${controlsClassName || ''}`} style={{ marginBottom: 16 }}>
          <Space>
            {searchable && (
              <Search
                placeholder={searchPlaceholder}
                allowClear
                enterButton={<SearchOutlined />}
                size="middle"
                style={{ width: 300 }}
                onSearch={handleSearch}
                onChange={(e) => setSearchValue(e.target.value)}
                value={searchValue}
              />
            )}
            {filterable && (
              <Select
                placeholder={filterPlaceholder}
                style={{ width: 150 }}
                allowClear
                onChange={(value) => onFilter?.({ status: value })}
              >
                {filterOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.text}
                  </Option>
                ))}
              </Select>
            )}
          </Space>
        </div>
      )}
      
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={defaultPagination}
        scroll={{ x: 'max-content' }}
        size="middle"
        rowKey={(record) => record.id || record.key}
        locale={emptyText ? { emptyText } : undefined}
        {...props}
      />
    </div>
  );
};

export default DataTable;