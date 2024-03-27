import React from 'react';
import './App.css';
import Modal from './components/Modal';
import {Table, Input, TableColumnsType, TableColumnType, GetRef, Button, Space} from "antd";
import type { Comment } from './types';
import type { SearchProps } from 'antd/es/input/Search';
import { SearchOutlined } from '@ant-design/icons';
import type { FilterDropdownProps } from 'antd/es/table/interface';


const { Search } = Input;
type InputRef = GetRef<typeof Input>;


function App() {
    /***************************************
     * HOOKS & HANDLERS
     **************************************/

    const [dataSource, setDataSource] = React.useState<Comment[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [totalDataCount, setTotalDataCount] = React.useState<number>(0);
    const [displayModal, setDisplayModal] = React.useState<boolean>(false);
    const [selectedData, setSelectedData] = React.useState<Comment | null>(null);
    const [searchText, setSearchText] = React.useState<string>("");
    const [isSearch, setIsSearch] = React.useState<boolean>(false);
    const searchInput = React.useRef<InputRef>(null);


    const handleSearch = (
        selectedKeys: string[],
      ) => {

        if (selectedKeys[0] == null || selectedKeys[0] == "") {
            setIsSearch(false);
            fetchData(0,10);
            return
        }
 
        setSearchText(selectedKeys[0]);
        fetchSearchData(selectedKeys[0]);
  
      };
    
      const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
      };

    const getColumnSearchProps = (dataIndex: Comment["email"]): TableColumnType<Comment> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, clearFilters, close }) => (
          <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
            <Input
              ref={searchInput}
              placeholder={`Search ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => handleSearch(selectedKeys as string[])}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys as string[])}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Search
              </Button>
              <Button
                onClick={() => clearFilters && handleReset(clearFilters)}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
              
              <Button
                type="link"
                size="small"
                onClick={() => {
                  close();
                }}
              >
                close
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered: boolean) => (
          <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        
        
      });
    
    const columns: TableColumnsType<Comment> = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id'
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ...getColumnSearchProps('email')
        },
        {
            title: 'Body',
            dataIndex: 'body',
            key: 'body'
        }
    ]

    const fetchData = async (start : number, end : number) => {
        setLoading(true);
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?_start=${start}&_end=${end}`);
        const totalCount = response.headers.get("X-Total-Count");
        setTotalDataCount(parseInt(totalCount || '0'));
        const data = await response.json();
        setDataSource(data);
        setLoading(false);
    }

    const handlePageChange = (pagination: any) => {
        const { pageSize, current } = pagination;
        const start = (current-1) * pageSize;
        const end = current * pageSize;
        fetchData(start, end);

    }

    const handleOnClick = (data : Comment) => {
        setSelectedData(data);
        setDisplayModal(true);
        
    }

    const fetchSearchData = async (value: string) => {
        setLoading(true);
        if (value === "") {
            setIsSearch(false);
            fetchData(0,10)
            return
        }
        setIsSearch(true)
        setSearchText(value);
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?email=${value}`); 
        const totalCount = response.headers.get("X-Total-Count");
        setTotalDataCount(parseInt(totalCount || '0'));
        const data = await response.json();
        setDataSource(data);
        setLoading(false);
    }

    const fetchNextSearchData = async (start:number, end:number) => {
        setLoading(true);
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?email=${searchText}&_start=${start}&_end=${end}`); 
        const data = await response.json();
        setDataSource(data);
        setLoading(false);
   

    }

    const handleSearchPageChange = (pagination: any) => {
        const { pageSize, current } = pagination;
        const start = (current-1) * pageSize;
        const end = current * pageSize;
        fetchNextSearchData(start, end);
    }

    React.useEffect(() => {
        fetchData(0,10);
        
    }, []);



    /***************************************
     * RENDER
     **************************************/
    return <div className="App">{/* INSERT CODE HERE */}
    <Search placeholder='Input user email here' allowClear onSearch={fetchSearchData} style={{width:500}}/>
    <Table 
    loading={loading} 
    dataSource={dataSource} 
    columns={columns}
    pagination={{total: totalDataCount, pageSize: 10, showSizeChanger:false}}
    onChange={isSearch?handleSearchPageChange:handlePageChange}
    onRow={(record: Comment) => ({
        onClick: () => {handleOnClick(record);}
    })}
    rowKey="id"
    />
    <Modal
        comment={selectedData}
        open={displayModal}
        onCancel={()=>setDisplayModal(false)}
        onOk={()=>setDisplayModal(false)}
        />
 
   </div>
}

export default App;
