import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Popconfirm, Form, Select, message } from 'antd';
import Notiflix from "notiflix";
import OpenModal from './OpenModal';
import axios from 'axios'
import cookies from 'react-cookies'
const host = 'http://' + window.location.hostname
const { Option } = Select;
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
        if (editing) {
            inputRef.current.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };

    const save = () => {
        try {
            Notiflix.Confirm.show(
                'Xác nhận',
                'Bạn có muốn lưu thông tin?',
                'Đồng ý',
                'Huỷ',

                // ok button callback
                async function () {
                    const values = await form.validateFields()
                    toggleEdit()
                    handleSave({ ...record, ...values })
                },

                // cancel button callback
                function () {
                    toggleEdit()
                },

                // extend the init options for this confirm box
                {
                    width: '320px',
                    borderRadius: '8px',
                },
            );


        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (<Form.Item
            style={{
                margin: 0,
            }}
            name={dataIndex}
            rules={[
                {
                    required: true,
                    message: `${title} is required.`,
                },
            ]}
        >
            <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>

        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{
                    paddingRight: 24,
                }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
}


export default class EditableTable extends React.Component {
    constructor(props) {
        super(props);
        this.defineColumn = this.defineColumn.bind(this);
        this.saveSelect = this.saveSelect.bind(this)
        this.receiveFinished = this.receiveFinished.bind(this)
        this.state = {
            columns: [],
            dataSource: [],
            count: 0,
        };
    }

    //important
    defineColumn() {
        switch (this.props.manage) {
            case 'account':
                this.setState({
                    columns: [{
                        title: 'Tên tài khoản',
                        dataIndex: 'username',
                        editable: this.props.accountCategory === "admin" ? true : false,
                    },
                    {
                        title: 'Email',
                        dataIndex: 'email',
                        editable: this.props.accountCategory === "admin" ? true : false,
                    },
                    {
                        title: 'Tạo lại mật khẩu',
                        dataIndex: 'rePassword',
                        render: (_, record) => {
                            if (record.state === "active")
                                return (<Button>Tạo lại</Button>)
                        },
                    },
                    {
                        title: 'Trạng thái',
                        dataIndex: 'state',
                    },
                    {
                        title: 'Loại tài khoản',
                        dataIndex: 'category_ID',
                        render: (_, record) => {

                            return (
                                <Select defaultValue={record.category_ID} onChange={(values) => {
                                    record.category_ID = values
                                    this.saveSelect(record)
                                }}>
                                    {Array.isArray(this.props.categorys) ? this.props.categorys.map(item =>
                                        <Option value={item.key}>{item.value}</Option>
                                    ) : ''}
                                </Select>
                            )
                        }
                    },
                    {
                        title: 'Xoá',
                        dataIndex: 'delete',
                        render: (_, record) =>
                            this.state.dataSource.length >= 1 ? (
                                <Popconfirm title="Bạn có muốn xoá?" onConfirm={() => this.handleDelete(record.account_ID)}>
                                    <a>Xoá</a>
                                </Popconfirm>
                            ) : null,
                    },
                    ]
                })
                break
            case 'customer':
                this.setState({
                    columns: [{
                        title: 'Tên khách hàng',
                        dataIndex: 'customer_name',
                        editable: true,
                    },
                    {
                        title: 'Số điện thoại',
                        dataIndex: 'phone_number',
                        editable: true,
                    },
                    {
                        title: 'Tuổi',
                        dataIndex: 'age',
                        editable: true,
                    },
                    {
                        title: 'Giới tính',
                        dataIndex: 'gender',
                        render: (_, record) => {

                            return (
                                <Select defaultValue={record.gender} onChange={(values) => {
                                    record.gender = values
                                    this.saveSelect(record)
                                }}>
                                    <Option value={'Nam'}>Nam</Option>
                                    <Option value={'Nữ'}>Nữ</Option>
                                </Select>
                            )
                        }
                    },
                    {
                        title: 'Số CMNN',
                        dataIndex: 'identify_number',
                        editable: true,
                    },
                    {
                        title: 'Đặt phòng',
                        dataIndex: 'booking',
                        render: (_, record) => {

                            return (<OpenModal title="Đặt phòng" manage='order' categorys={this.props.categorys} finished={this.receiveFinished} data={record} />)
                        }
                    },
                    this.props.accountCategory === 'letan' ?
                        {}
                        : ({
                            title: 'Xoá',
                            dataIndex: 'delete',
                            render: (_, record) =>
                                this.state.dataSource.length >= 1 ? (
                                    <Popconfirm title="Bạn có muốn xoá?" onConfirm={() => this.handleDelete(record.customer_ID)}>
                                        <a>Xoá</a>
                                    </Popconfirm>
                                ) : null,
                        }),
                    ]
                })
                break
            case 'room_category':
                this.setState({
                    columns: [{
                        title: 'Tên loại phòng',
                        dataIndex: 'room_category_name',
                        editable: this.props.accountCategory === "letan" ? false : true,
                    },
                    {
                        title: 'Giường đơn',
                        dataIndex: 'single_bed',
                        editable: this.props.accountCategory === "letan" ? false : true,
                    },
                    {
                        title: 'Giường đôi',
                        dataIndex: 'double_bed',
                        editable: this.props.accountCategory === "letan" ? false : true,
                    },
                    {
                        title: 'Diện tích',
                        dataIndex: 'area',
                        editable: this.props.accountCategory === "letan" ? false : true,
                        render: (_, record) => (record.area + ' m2')
                    },
                    this.props.accountCategory !== "letan" ?
                        {
                            title: 'Mô tả',
                            dataIndex: 'description',
                            editable: true,
                        } : {},
                    {
                        title: 'Tình trạng',
                        dataIndex: 'available',
                        render: (_, record) => {
                            if (record.available === 0)
                                return "Hết phòng"
                            else return `Còn ${record.available} phòng`
                        }
                    },
                    {
                        title: 'Giá một ngày',
                        dataIndex: 'price_on_day',
                        editable: this.props.accountCategory === "letan" ? false : true,
                        render: (_, record) => (record.price_on_day + ' VNĐ')
                    },
                    this.props.accountCategory === 'letan' ?
                        {}
                        : ({
                            title: 'Xoá',
                            dataIndex: 'delete',
                            render: (_, record) =>
                                this.state.dataSource.length >= 1 ? (
                                    <Popconfirm title="Bạn có muốn xoá?" onConfirm={() => this.handleDelete(record.room_category_ID)}>
                                        <a>Xoá</a>
                                    </Popconfirm>
                                ) : null,
                        }),
                    ]
                })
                break
            case 'room':
                this.setState({
                    columns: [{
                        title: 'Tên phòng',
                        dataIndex: 'room_category_name',
                        render: (_, record) => (`${record.room_category_name} ${record.room_number}`)
                    },
                    {
                        title: 'Trạng thái',
                        dataIndex: 'state',
                        render: (_, record) => {
                            if (this.props.accountCategory === 'admin')
                                return (
                                    <Select defaultValue={record.state} onChange={(values) => {
                                        record.state = values
                                        this.saveSelect(record)
                                    }}>
                                        <Option value={'disable'}>Disable</Option>
                                        <Option value={'empty'}>Empty</Option>
                                        <Option value={'using'}>Using</Option>
                                    </Select>
                                )
                            else return record.state
                        }
                    },
                    {
                        title: 'Xoá',
                        dataIndex: 'delete',
                        render: (_, record) => {
                            let max = record.room_number
                            let final = true
                            this.state.dataSource.forEach(item => {
                                if (record.room_category_ID === item.room_category_ID) {
                                    if (item.room_number > max)
                                        final = false
                                }
                            })
                            return (this.state.dataSource.length >= 1 ? (
                                final ?
                                    <Popconfirm title="Bạn có muốn xoá?" onConfirm={() => this.handleDelete(record.room_category_ID + '.' + record.room_number)}>
                                        <a>Xoá</a>
                                    </Popconfirm> : ''
                            ) : null)
                        },
                    },
                    ]
                })
                break
            case 'order':
                this.setState({
                    columns: [{
                        title: 'ID đơn đặt',
                        dataIndex: 'order_ID',
                    },
                    {
                        title: 'Tên khách đặt',
                        dataIndex: 'customer_name',

                        render: (_, record) => {
                            return (
                                <Select defaultValue={record.customer_ID} onChange={(values) => {
                                    record.customer_ID = values
                                    this.saveSelect(record)
                                }} >
                                    {
                                        Array.isArray(this.props.categorys) ? this.props.categorys.map(item =>
                                            <Option value={item.key}>{item.value}</Option>
                                        ) : ''
                                    }
                                </Select >
                            )
                        }
                    },
                    {
                        title: 'Nhân viên đặt',
                        dataIndex: 'username',
                    },
                    {
                        title: 'Số người lớn',
                        dataIndex: 'adults',
                        editable: true
                    },
                    {
                        title: 'Số trẻ',
                        dataIndex: 'childrens',
                        editable: true
                    },
                    {
                        title: 'Yêu cầu đặc biệt',
                        dataIndex: 'customers_required',
                        editable: true
                    },
                    {
                        title: 'Xoá',
                        dataIndex: 'delete',
                        render: (_, record) => {
                            return (this.state.dataSource.length >= 1 ?
                                <Popconfirm title="Bạn có muốn xoá?" onConfirm={() => this.handleDelete(record.order_ID)}>
                                    <a>Xoá</a>
                                </Popconfirm>
                                : null)
                        },
                    },
                    ]
                })
                break

            case 'order_detail':
                this.setState({
                    columns: [{
                        title: 'ID đơn đặt',
                        dataIndex: 'order_ID',
                    },
                    {
                        title: 'ID chi tiết',
                        dataIndex: 'order_detail_ID',
                    },
                    {
                        title: 'Tên phòng',
                        dataIndex: 'room_category_name',
                        render: (_, record) => (`${record.room_category_name} ${record.room_number}`)
                    },
                    {
                        title: 'Check',
                        dataIndex: 'check',
                        render: (_, record) => {

                            return <Button onClick={this.action('check_in', {order_detail_ID:record.order_detail_ID,check_in:new Date()})}>{record.check_in === null ? 'Check in' : record.check_out === null ? 'Check out' : 'Error'}</Button>

                        }
                    },
                    {
                        title: 'Gía 1 ngày',
                        dataIndex: 'price_on_day'
                    },
                    {
                        title: 'Yêu cầu đặc biệt',
                        dataIndex: 'customer_required',
                        editable: true
                    }
                        /* {
                             title: 'Xoá',
                             dataIndex: 'delete',
                             render: (_, record) => {
                                 return (this.state.dataSource.length >= 1 ?
                                     <Popconfirm title="Bạn có muốn xoá?" onConfirm={() => this.handleDelete(record.order_ID)}>
                                         <a>Xoá</a>
                                     </Popconfirm>
                                     : null)
                             },
                         },*/
                    ]
                })
                break
            default:
        }




    }
    receiveFinished(value) {
        console.log(value)
        if (value !== undefined) {
            this.handleGet()
        }
    }
    action(type, value) {
        this.props.action(type, value)
    }


    async handleGet() {
        let response = await axios.post(`${host}:5000/${this.props.manage}/getAll`, { jwt: cookies.load("jwt") })
        if (response.data.status) {
            message.success("Tải danh sách thành công.")
            let data = response.data.list
            console.log(data)
            this.setState({
                dataSource: data
            })
            this.setState({ count: data.length })
            this.defineColumn()
        } else message.error(response.data.message)
    }

    componentDidMount() {
        this.handleGet()
    }
    componentDidUpdate(prevProps) {
        if (this.props.manage !== prevProps.manage ||
            (this.props.finished !== prevProps.finished && this.props.finished === true)) {
            this.handleGet()
        }
        if (this.props.search != prevProps.search) {
            if (this.props.search !== undefined)
                this.setState({ dataSource: this.props.search })
            else this.handleGet()
        }
    }

    handleDelete = (id) => {
        axios.delete(`${host}:5000/${this.props.manage}/${id}/${cookies.load("jwt")}`).then(response => {
            if (response.data.status) {
                message.success("Xoá thành công")
                this.handleGet()
            } else message.error(response.data.message)
        })
            .catch(err => {
                message.error(err)
            })
    }
    saveSelect(values) {
        try {
            Notiflix.Confirm.show(
                'Xác nhận',
                'Bạn có muốn lưu thông tin?',
                'Đồng ý',
                'Huỷ',

                // ok button callback

                () => {

                    this.handleSave(values)
                }
                ,

                // cancel button callback
                function () {

                },

                // extend the init options for this confirm box
                {
                    width: '320px',
                    borderRadius: '8px',
                },
            );


        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    }
    handleSave = async (values) => {
        let id = values[Object.keys(values)[0]]
        delete values[Object.keys(values)[0]]
        console.log(values)
        axios.put(`${host}:5000/${this.props.manage}/${id}`, { jwt: cookies.load('jwt'), data: values }).then(response => {
            if (response.data.status) {
                message.success("Cập nhật thành công")
                this.handleGet()
            }
            else message.error(response.data.message)
        }).catch(err => {
            message.error(err)
        })
    }

    render() {
        const components = {
            body: {
                row: EditableRow,
                cell: EditableCell,
            },
        };
        const columns = this.state.columns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: (record) => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                }),
            };
        });
        return (
            <div>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={this.state.dataSource}
                    columns={columns}
                />
            </div>
        );
    }
}