import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, InputNumber, message } from 'antd';
import axios from 'axios';
import cookies from 'react-cookies';
const host = 'http://' + window.location.hostname
const { Option } = Select;

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

const CustomForm = (props) => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        values.jwt = cookies.load('jwt')
        form.resetFields();
        if (props.action === "add") {

            axios.post(`${host}:5000/${props.manage}/`, values).then(response => {
                console.log(response)
                if (response.data.status) {
                    message.success("Thêm thành công")
                    props.finished(true)
                } else {
                    message.error(response.data.message)
                    props.finished(false)
                }
            }).catch(err => {
                message.error(err)
            })
        }
        else if (props.action === "update") {
            axios.put(`${host}:5000/${props.manage}/${props.id}`, values).then(response => {
                if (response.data.status) {
                    message.success("Cập nhật thành công")
                    props.finished(true)
                } else {
                    message.error(response.data.message)
                    props.finished(false)
                }
            }).catch(err => {
                message.error(err)
            })
        }
    };

    const onFinishFailed = (errorInfo) => {
        props.finished(false)
    };


    return (
        <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
        >
            {Array.isArray(props.inputs) ? () => {
                let result = []

                for (let i = 0; i < props.inputs.length; i++) {
                    let input = props.inputs[i]
                    let item
                    switch (input.type) {
                        case "select":
                            item = (<Select defaultValue={input.label}>
                                {input.values.map((item =>
                                    <Option value={item.key}>{item.value}</Option>
                                ))}
                            </Select>)
                            break
                        case "normal":
                            item = (<Input />)
                            break
                        case 'datetimepicker':
                            item = (<DatePicker />)
                            break
                        case 'rangepicker':
                            item = (<DatePicker.RangePicker />)
                            break
                        case 'number':
                            item = (<InputNumber min={input.min} max={input.max} defaultValue={input.defaultValue} />)
                            break
                        case 'textarea':
                            item = (<Input.TextArea rows={input.rows} />)
                            break
                        default:
                    }

                    result.push(
                        <Form.Item
                            label={input.label}
                            name={input.name}
                            rules={input.rules}
                        >
                            {item}
                        </Form.Item>)
                }
                result.push(<Form.Item {...tailLayout}>
                    <Button className="submit" hidden type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>)
                //console.log(result)
                return result
            } : ''}

        </Form>
    );
};
export default CustomForm