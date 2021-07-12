import React, { Component } from 'react'
import { Form, Input, Button, Checkbox, message } from 'antd';
import axios from 'axios'
import cookies from 'react-cookies'
const host = 'https://' + window.location.hostname

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

export default class ActiveAccountForm extends Component {
    onFinish = (values) => {
        
        if (values.newPassword === '') {
            message.error("Mật khẩu rỗng")
        }
        else if (values.newPassword !== values.newPasswordConfirm) {
            message.error("Mật khẩu xác nhận không khớp")
        } else {
            axios.post(host + ':5000/account/login', values).then( async res => {
                
                if (res.data.status) {
                    console.log(res.data)
                    message.success("Active successful!")
                    setTimeout(() => {
                        window.location.reload()
                        window.location = '/login'
                    }, 2000)
                }
                else {
                    message.success("Active fail!")
                    message.error(res.data.message)
                }
            }).catch(err => {
                message.error(`${err}`)
            })
        }
       

    };
    onFinishFailed = (errorInfo) => {
        console.log(errorInfo)
    };
    componentDidMount(){
        var keys = Object.keys(cookies.loadAll())
        keys.forEach(key => {
          cookies.remove(key)
        })
    }
    render() {
        return (
            <Form
                {...layout}
                name="basic"
                initialValues={{ remember: true }}
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}

            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Mã kích hoạt"
                    name="activeCode"
                    rules={[{ required: true, message: 'Please input your mã kích hoạt!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    label="Xác nhận mật khẩu mới"
                    name="newPasswordConfirm"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password />
                </Form.Item>



                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        )
    }
}
