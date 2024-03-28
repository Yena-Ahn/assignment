import React from 'react';
import './App.css';
import Modal from './components/Modal';
import {Table, Input, TableColumnsType, TableColumnType, GetRef, Button, Space} from "antd";
import type { Comment } from './types';
import { SearchOutlined } from '@ant-design/icons';


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
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const [pageSize, setPageSize] = React.useState<number>(10);


    const handleSearch = (
        selectedKeys: string[],
      ) => {

        if (!selectedKeys[0]) { //null, undefined, empty string
            setIsSearch(false);
            return
        }
        setIsSearch(true);
        setSearchText(selectedKeys[0]);
  
      };
    
      const handleReset = (clearFilters: () => void) => {
        clearFilters();

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
    ];

    const fetchData = React.useCallback(async (start : number, end : number) => {
        setLoading(true);
        try {
            const queryString = isSearch ? `email=${searchText}` : `_start=${start}&_end=${end}`;

            const response = await fetch(`https://jsonplaceholder.typicode.com/comments?${queryString}`);

            if (response.ok) {
                const totalCount = response.headers.get("X-Total-Count");
                setTotalDataCount(parseInt(totalCount || '0'));
                const data = await response.json();
                setDataSource(data);
            } else {
                throw new Error(JSON.stringify({ code: response.status, message: response.statusText }));
            }

        } catch (error) {
              console.error(error);
            }
        
        setLoading(false);
    }, [setLoading, setTotalDataCount, setDataSource, isSearch, searchText]);

  



    const handleOnClick = (data : Comment) => {
        setSelectedData(data);
        setDisplayModal(true);
        
    }



    const handleOnSearch = (value:string, event:any, config:any) => {
        const {source} = config;
        
        if (source === "clear") {
            setCurrentPage(1);
        }
        if (value === "") {
            setIsSearch(false);

        } else {
            setSearchText(value);
            setIsSearch(true);
            
        }
    }

    const handleOnTableChange = (pagination: any) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
        
    }




    React.useEffect(() => {
        fetchData((currentPage-1)*pageSize,currentPage*pageSize);
        
    },[fetchData, isSearch, currentPage, pageSize]);



    /***************************************
     * RENDER
     **************************************/
    return <div className="App">{/* INSERT CODE HERE */}
    <Search placeholder='Input user email here' allowClear onSearch={handleOnSearch} style={{width:500}} />
    <Table 
    loading={loading} 
    dataSource={dataSource} 
    columns={columns}
    pagination={{total: totalDataCount}}
    onChange={handleOnTableChange}
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
