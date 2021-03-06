import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Popconfirm, Form, Select, Row, message } from 'antd';
import Notiflix from "notiflix";
import OpenModal from './OpenModal';
import axios from 'axios'
import cookies from 'react-cookies'
const host = 'https://' + window.location.hostname
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

const Link = (props) => {
    const transitive = async () => {

        props.component.props.transition({ manage: props.manage, value: props.value })
    }
    return (<a onClick={transitive}>{props.text === undefined ? props.value : props.text}</a>)
}
const DetailButton = (props) => {
    const transitive = async () => {
        console.log(props.manage)
        props.component.props.transition({ manage: props.manage, value: props.value })
    }
    return (<Button onClick={transitive}>{props.text === undefined ? props.value : props.text}</Button>)
}

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
        this.action = this.action.bind(this)
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

                            return (<OpenModal title="Đặt phòng" manage='order' customer={record.customer_ID} categorys={this.props.categorys} finished={this.receiveFinished} data={record} />)
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
                    {
                        title: 'Chi tiết',
                        dataIndex: 'detail',
                        render: (_, record) => (<Link component={this} manage='room' value={record.room_category_name} text='Chi tiết' />)
                    },
                    this.props.accountCategory === 'letan' ?
                        undefined
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
                                        <Option value={'booked'}>Booked</Option>
                                        <Option value={'using'}>Using</Option>
                                    </Select>
                                )
                            else return record.state
                        }
                    },
                    {
                        title: 'Chi tiết',
                        dataIndex: 'detail',
                        render: (_, record) => (<Link component={this} manage='room_category' value={record.room_category_name} text='Chi tiết' />)
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
                        render: (_, record) => <Link component={this} manage='order_detail' value={record.order_ID} />
                    },
                    {
                        title: 'Tên khách đặt',
                        dataIndex: 'customer_name',

                        /*render: (_, record) => {
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
                        }*/
                    },
                    {
                        title: 'Nhân viên đặt',
                        dataIndex: 'username',
                        render: (_, record) => (<Link component={this} manage='account' value={record.account_ID} />)
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
                        render: (_, record) => <Link component={this} manage='order' value={record.order_ID} />
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
                            if (record.state !== 'paid') {
                                if (record.check_in === null)
                                    return <Button onClick={() => this.action({ path: `/order_detail/check_in/${record.order_detail_ID}` })} >Check in</Button>
                                else if (record.check_in === null)
                                    return <Button onClick={() => this.action({ path:`/order_detail/check_out/${record.order_detail_ID}` })} >Check out</Button>
                                else return (<>
                                    <Row><Button onClick={() => this.action({ path: `/order_detail/confirm_pay/${record.order_detail_ID}` })} >Tiền mặt {record.total_pays} VNĐ</Button></Row>
                                    <Row><Button onClick={() => this.action({ path: '/payment', value: record.total_pays, action: 'post' })}>Zalo Pay</Button></Row>
                                </>)
                            }
                            return 'Tất toán'
                        }
                    },
                    {
                        title: 'Tình trạng',
                        dataIndex: 'state_order',
                        render: (_, record) => {
                            if (record.check_in === null) return 'Chưa check in'
                            else if (record.check_out === null) return 'Đang thuê'
                            else if (record.state === 'prepare') return `Cần thanh toán ${record.total_pays} VNĐ`
                            else return 'Đã thanh toán'
                        }
                    },
                    {
                        title: 'Yêu cầu đặc biệt',
                        dataIndex: 'customer_required',
                        editable: true
                    },
                    {
                        title: 'Thêm dịch vụ',
                        dataIndex: 'service',
                        render: (_, record) => {
                            if (record.state !== 'prepare')
                                return (<OpenModal title="Thêm dịch vụ" manage='service_detail' order_detail={record.order_detail_ID} categorys={this.props.categorys} finished={this.receiveFinished} data={record} />)
                        }
                    },
                    this.props.accountCategory === 'admin' ? {
                        title: 'Xoá',
                        dataIndex: 'delete',
                        render: (_, record) => {
                            return (this.state.dataSource.length >= 1 ?
                                <Popconfirm title="Bạn có muốn xoá?" onConfirm={() => this.handleDelete(record.order_detail_ID)}>
                                    <a>Xoá</a>
                                </Popconfirm>
                                : null)
                        },
                    } : undefined,
                    ]
                })
                break
            case 'service':
                this.setState({
                    columns: [{
                        title: 'Mã dịch vụ',
                        dataIndex: 'service_ID',
                        render: (_, record) => <Link component={this} manage='service_detail' value={record.service_ID} />
                    }, {
                        title: 'Tên dịch vụ',
                        dataIndex: 'service_name',
                        editable: this.props.accountCategory === "letan" ? false : true,
                    },
                    this.props.accountCategory === 'dichvu' ? undefined :
                        {
                            title: 'Tên nhân viên',
                            dataIndex: 'username',

                            render: (_, record) => {
                                return this.props.accountCategory === 'admin' ? (
                                    <Select defaultValue={record.account_ID} onChange={(values) => {
                                        record.account_ID = values
                                        this.saveSelect(record)
                                    }} >
                                        {
                                            Array.isArray(this.props.categorys) ? this.props.categorys.map(item =>
                                                <Option value={item.key}>{item.value}</Option>
                                            ) : ''
                                        }
                                    </Select >
                                ) : record.username
                            }
                        },
                    {
                        title: 'Mô tả',
                        dataIndex: 'description',
                        editable: this.props.accountCategory === "letan" ? false : true,
                    },

                    {
                        title: 'Tình trạng',
                        dataIndex: 'state',
                        render: (_, record) => {
                            if (this.props.accountCategory !== 'letan')
                                return (
                                    <Select defaultValue={record.state} onChange={(values) => {
                                        record.state = values
                                        this.saveSelect(record)
                                    }}>
                                        <Option value={'disabled'}>Bị vô hiệu</Option>
                                        <Option value={'fixing'}>Đang sửa</Option>
                                        <Option value={'sold_out'}>Hết hàng</Option>
                                        <Option value={'available'}>Vẫn còn</Option>
                                    </Select>
                                )
                            else return record.state
                        }
                    },
                    {
                        title: 'Giá ',
                        dataIndex: 'price_on_day',
                        editable: this.props.accountCategory === "admin" ? true : false,
                        render: (_, record) => (record.price + ' VNĐ')
                    },
                    this.props.accountCategory === 'admin' ?
                        {
                            title: 'Xoá',
                            dataIndex: 'delete',
                            render: (_, record) =>
                                this.state.dataSource.length >= 1 ? (
                                    <Popconfirm title="Bạn có muốn xoá?" onConfirm={() => this.handleDelete(record.service_ID)}>
                                        <a>Xoá</a>
                                    </Popconfirm>
                                ) : null,
                        } : undefined,
                    ]
                })
                break
            case 'service_detail':
                this.setState({
                    columns: [
                        {
                            title: 'Mã chi tiết dịch vụ',
                            dataIndex: 'service_detail_ID',
                        },
                        {
                            title: 'Loại dịch vụ',
                            dataIndex: 'service_ID',
                            render: (_, record) => {
                                return this.props.accountCategory === 'admin' ? (
                                    <Select defaultValue={record.service_ID} onChange={(values) => {
                                        record.service_ID = values
                                        this.saveSelect(record)
                                    }} >
                                        {
                                            Array.isArray(this.props.categorys) ? this.props.categorys.map(item =>
                                                <Option value={item.key}>{item.value}</Option>
                                            ) : ''
                                        }
                                    </Select >
                                ) : record.service_ID
                            }
                        },
                        {
                            title: 'Mã chi tiết đơn',
                            dataIndex: 'order_detail_ID',
                            render: (_, record) => <Link component={this} manage='order_detail' value={record.order_detail_ID} />
                        },
                        {
                            title: 'Số lượng',
                            dataIndex: 'quantity'
                        },
                        {
                            title: 'Giá',
                            dataIndex: 'price',
                            render: (_, record) => record.price + ' VNĐ'
                        },
                        {
                            title: 'Tổng công',
                            dataIndex: 'total_pay',
                            render: (_, record) => record.total_pay + ' VNĐ'
                        },
                        {
                            title: 'Xoá',
                            dataIndex: 'delete',
                            render: (_, record) => {
                                return (this.state.dataSource.length >= 1 ? (
                                    <Popconfirm title="Bạn có muốn xoá?" onConfirm={() => this.handleDelete(record.service_detail_ID)}>
                                        <a>Xoá</a>
                                    </Popconfirm>
                                ) : undefined)
                            },
                        },
                    ]
                })
                break
            case 'supply_category':
                this.setState({
                    columns: [{
                        title: 'Tên loại dịch vụ',
                        dataIndex: 'supply_category_name',
                        editable: this.props.accountCategory === "admin" ? true : false,
                    },
                    {
                        title: 'Loại sỡ hữu',
                        dataIndex: 'supply_type',
                        render: (_, record) => {
                            if (this.props.accountCategory === 'admin')
                                return (
                                    <Select defaultValue={record.supply_type} onChange={(values) => {
                                        record.supply_type = values
                                        this.saveSelect(record)
                                    }}>
                                        <Option value={'room'}>Phòng</Option>
                                        <Option value={'department'}>Khách sạn</Option>
                                    </Select>
                                )
                            else return record.state
                        }
                    },

                    this.props.accountCategory === 'admin' ?
                        ({
                            title: 'Xoá',
                            dataIndex: 'delete',
                            render: (_, record) =>
                                this.state.dataSource.length >= 1 ? (
                                    <Popconfirm title="Bạn có muốn xoá?" onConfirm={() => this.handleDelete(record.supply_category_ID)}>
                                        <a>Xoá</a>
                                    </Popconfirm>
                                ) : null,
                        }) : undefined,
                    ]
                })
                break
            case 'room_supply':
                this.setState({
                    columns: [
                        {
                            title: 'Tên tài sản',
                            dataIndex: 'supply_name',
                            editable: this.props.accountCategory === "ketoan" ? false : true,
                        },
                        {
                            title: 'Thuộc về',
                            dataIndex: 'room_code',
                            render: (_, record) => this.props.accountCategory === 'admin' ?
                                (<Select defaultValue={`${record.room_category_ID}.${record.room_number}`} onChange={(values) => {
                                    record.room_code = values
                                    this.saveSelect(record)
                                }} >
                                    {
                                        Array.isArray(this.props.categorys[0]) ? this.props.categorys[0].map(item =>
                                            <Option value={item.key}>{item.value}</Option>
                                        ) : ''
                                    }
                                </Select >)
                                : (`${record.room_category_name} ${record.room_number}`)
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'state',
                            editable: this.props.accountCategory === "ketoan" ? false : true
                        },
                        this.props.accountCategory === 'kithuat' ? undefined :
                            {
                                title: 'Chi tiết loại',
                                dataIndex: 'supply_category_ID',
                                render: (_, record) => {
                                    if (this.props.accountCategory === 'ketoan')
                                        return (<Link component={this} manage='supply_category' value={record.supply_category_ID} />)
                                    else if (this.props.accountCategory === 'admin') return (
                                        <Select defaultValue={record.supply_category_ID} onChange={(values) => {
                                            record.supply_category_ID = values
                                            this.saveSelect(record)
                                        }} >
                                            {
                                                this.props.categorys[1] !== undefined ? this.props.categorys[1].map(item =>
                                                    <Option value={item.key}>{item.value}</Option>
                                                ) : ''
                                            }
                                        </Select >
                                    )
                                }
                            },
                        this.props.accountCategory === 'admin' ?
                            ({
                                title: 'Xoá',
                                dataIndex: 'delete',
                                render: (_, record) =>
                                    this.state.dataSource.length >= 1 ? (
                                        <Popconfirm title="Bạn có muốn xoá?" onConfirm={() => this.handleDelete(record.supply_ID)}>
                                            <a>Xoá</a>
                                        </Popconfirm>
                                    ) : null,
                            }) : undefined,
                    ]
                })
                break
            case 'department_supply':
                this.setState({
                    columns: [
                        {
                            title: 'Tên tài sản',
                            dataIndex: 'supply_name',
                            editable: this.props.accountCategory === "ketoan" ? false : true
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'state',
                            editable: this.props.accountCategory === "ketoan" ? false : true
                        },
                        this.props.accountCategory === 'kithuat' ? undefined :
                            {
                                title: 'Chi tiết loại',
                                dataIndex: 'supply_category_ID',
                                render: (_, record) => {

                                    return (<Link component={this} manage='supply_category' value={record.supply_category_ID} text='Chi tiết' />)

                                }
                            },
                        this.props.accountCategory === 'admin' ?
                            ({
                                title: 'Xoá',
                                dataIndex: 'delete',
                                render: (_, record) =>
                                    this.state.dataSource.length >= 1 ? (
                                        <Popconfirm title="Bạn có muốn xoá?" onConfirm={() => this.handleDelete(record.supply_ID)}>
                                            <a>Xoá</a>
                                        </Popconfirm>
                                    ) : null,
                            }) : undefined,
                    ]
                })
                break
            default:
        }
    }
    receiveFinished(value) {
        if (value !== undefined) {
            this.handleGet()
        }
    }
    action(data) {

        this.props.action(data)
    }


    async handleGet() {
        let response = await axios.post(`${host}:5000/${this.props.manage}/getAll`, { jwt: cookies.load("jwt") })
        if (response.data.status) {
            message.success("Tải danh sách thành công.")
            let data = response.data.list

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
        axios.delete(`${host}/${this.props.manage}/${id}/${cookies.load("jwt")}`).then(response => {
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

        axios.put(`${host}/${this.props.manage}/${id}`, { jwt: cookies.load('jwt'), data: values }).then(response => {
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