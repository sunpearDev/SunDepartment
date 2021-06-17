import React, { useState, useEffect } from 'react'
import { Menu, Button, message } from 'antd';
import {
    UserOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    SolutionOutlined,
    ApartmentOutlined,
    InsertRowBelowOutlined,
    ShopOutlined
} from '@ant-design/icons';
import axios from 'axios';
import cookies from 'react-cookies'
import { useHistory } from "react-router-dom";
const host = 'http://' + window.location.hostname


const { SubMenu } = Menu;

const DashboardSider = (props) => {
    const history = useHistory()
    const [collapsed, setCollapsed] = useState(false)
    const [defaultMenu, setDefaultMenu] = useState('')
    const [menus, setMenus] = useState([])


    const toggleCollapsed = () => {
        setCollapsed(!collapsed)
    }
    const handleClick = e => {
        let path = e.key
        props.menu(path)
    }
    useEffect(() => {
        axios.post(`${host}:5000/account/valid`, { jwt: cookies.load('jwt') }).then(response => {
            if (response.data.status) {
                defiWorkSpace(response.data.account_category)
                props.category(response.data.account_category)
            } else message.error(response.data.message)
        })

    })
    const defiWorkSpace = (category) => {
        let tempMenu = []

        switch (category) {
            case "nhansu":
                tempMenu.push({ key: "account", icon: <UserOutlined />, text: 'Quản lý tài khoản' })
                setDefaultMenu('account')
                break
            case "letan":
                tempMenu.push({ key: "customer", icon: <SolutionOutlined />, text: 'Quản lý khách hàng' })
                tempMenu.push({ key: "room_category", icon: <SolutionOutlined />, text: 'Quản lý loại phòng' })
                tempMenu.push({ key: "order", icon: <ShopOutlined />, text: 'Quản lý đơn đặt' })
                tempMenu.push({ key: "order_detail",icon: <ShopOutlined />, text: 'Quản lý chi tiết đơn đặt'})
                setDefaultMenu('customer')
                break
            case "kinhdoanh":
                tempMenu.push({ key: "room_category", icon: <SolutionOutlined />, text: 'Quản lý loại phòng' })
                setDefaultMenu('room_category')
                tempMenu.push({ key: "room", icon: <InsertRowBelowOutlined />, text: 'Quản lý phòng' })
                tempMenu.push({ key: "order", icon: <ShopOutlined />, text: 'Quản lý đơn đặt' })
                break
            case "admin":
                tempMenu.push({ key: "account", icon: <UserOutlined />, text: 'Quản lý tài khoản' })
                tempMenu.push({ key: "customer", icon: <SolutionOutlined />, text: 'Quản lý khách hàng' })
                tempMenu.push({ key: "room_category", icon: <ApartmentOutlined />, text: 'Quản lý loại phòng' })
                tempMenu.push({ key: "room", icon: <InsertRowBelowOutlined />, text: 'Quản lý phòng' })
                tempMenu.push({ key: "order", icon: <ShopOutlined />, text: 'Quản lý đơn đặt' })
                tempMenu.push({ key: "order_detail",icon: <ShopOutlined />, text: 'Quản lý chi tiết đơn đặt'})
                setDefaultMenu('account')
                break
            default:

        }
        setMenus(tempMenu)

    }

    return (
        <div>
            <Button type="primary" onClick={toggleCollapsed} style={{ marginBottom: 16 }}>
                {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
            </Button>
            <Menu
                defaultSelectedKeys={[defaultMenu]}
                defaultOpenKeys={['sub1']}
                mode="inline"
                theme="dark"
                onClick={handleClick}
                inlineCollapsed={collapsed}
            >
                {menus.map(menu =>
                    <Menu.Item key={menu.key} icon={menu.icon}>
                        {menu.text}
                    </Menu.Item>
                )}
            </Menu>
        </div>
    )
}
export default DashboardSider
