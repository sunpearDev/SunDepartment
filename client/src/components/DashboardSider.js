import React, { useState, useEffect } from 'react'
import { Menu, Button, message } from 'antd';
import {
    UserOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    SolutionOutlined,
    ApartmentOutlined,
    InsertRowBelowOutlined,
    ShopOutlined,
    AuditOutlined,
    ShoppingCartOutlined,
    PicRightOutlined
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
    const [accountCategory, setAccountCategory] = useState('')


    const toggleCollapsed = () => {
        setCollapsed(!collapsed)
    }
    const handleClick = e => {
        let path = e.key
        props.menu(path)
    }
    useEffect(() => {
        if (menus.length === 0) {
            axios.post(`${host}:5000/account/valid`, { jwt: cookies.load('jwt') }).then(response => {
                if (response.data.status) {
                    setAccountCategory(response.data.account_category)
                } else message.error(response.data.message)
            })
            defiWorkSpace(accountCategory)
            props.category(accountCategory)
        }

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
                tempMenu.push({ key: "order", icon: <ShoppingCartOutlined />, text: 'Quản lý đơn đặt' })
                tempMenu.push({ key: "order_detail", icon: <ShopOutlined />, text: 'Quản lý chi tiết đơn đặt' })
                setDefaultMenu('customer')
                tempMenu.push({ key: "service", icon: <AuditOutlined />, text: 'Quản lý dịch vụ' })
                tempMenu.push({ key: "service_detail", icon: <AuditOutlined />, text: 'Quản lý chi tiết dịch vụ' })
                break
            case "kinhdoanh":
                tempMenu.push({ key: "room_category", icon: <SolutionOutlined />, text: 'Quản lý loại phòng' })
                setDefaultMenu('room_category')
                tempMenu.push({ key: "room", icon: <InsertRowBelowOutlined />, text: 'Quản lý phòng' })
                tempMenu.push({ key: "order", icon: <ShoppingCartOutlined />, text: 'Quản lý đơn đặt' })
                break
            case "admin":
                tempMenu.push({ key: "account", icon: <UserOutlined />, text: 'Quản lý tài khoản' })
                tempMenu.push({ key: "customer", icon: <SolutionOutlined />, text: 'Quản lý khách hàng' })
                tempMenu.push({ key: "room_category", icon: <ApartmentOutlined />, text: 'Quản lý loại phòng' })
                tempMenu.push({ key: "room", icon: <InsertRowBelowOutlined />, text: 'Quản lý phòng' })
                tempMenu.push({ key: "order", icon: <ShoppingCartOutlined />, text: 'Quản lý đơn đặt' })
                tempMenu.push({ key: "order_detail", icon: <ShopOutlined />, text: 'Quản lý chi tiết đơn đặt' })
                tempMenu.push({ key: "service", icon: <AuditOutlined />, text: 'Quản lý dịch vụ' })
                tempMenu.push({ key: "service_detail", icon: <AuditOutlined />, text: 'Quản lý chi tiết dịch vụ' })
                tempMenu.push({ key: "supply_category", icon: <PicRightOutlined />, text: 'Quản lý loại tài sản' })
                tempMenu.push({ key: "room_supply", icon: <PicRightOutlined />, text: 'Quản lý tài sản phòng' })
                tempMenu.push({ key: "department_supply", icon: <PicRightOutlined />, text: 'Quản lý tài sản khách sạn' })
                setDefaultMenu('account')
                break
            case 'dichvu':
                tempMenu.push({ key: "service", icon: <AuditOutlined />, text: 'Quản lý dịch vụ' })
                tempMenu.push({ key: "service_detail", icon: <AuditOutlined />, text: 'Quản lý chi tiết dịch vụ' })

                break
            case 'ketoan':
                tempMenu.push({ key: "supply_category", icon: <PicRightOutlined />, text: 'Quản lý loại tài sản' })
                tempMenu.push({ key: "room_supply", icon: <PicRightOutlined />, text: 'Quản lý tài sản phòng' })
                tempMenu.push({ key: "department_supply", icon: <PicRightOutlined />, text: 'Quản lý tài sản khách sạn' })
                break
            case 'kithuat':
                tempMenu.push({ key: "room_supply", icon: <PicRightOutlined />, text: 'Quản lý tài sản phòng' })
                tempMenu.push({ key: "department_supply", icon: <PicRightOutlined />, text: 'Quản lý tài sản khách sạn' })
            default:

        }
        setMenus(tempMenu)

    }

    return (
        <div>

            <Menu
                defaultSelectedKeys={[defaultMenu]}
                defaultOpenKeys={[defaultMenu]}
                mode="inline"
                theme="dark"
                onClick={handleClick}
            >
                {menus.map(menu => {
                    return (
                        <Menu.Item key={menu.key} className={menu.key + '-menu'} icon={menu.icon}>
                            {menu.text}
                        </Menu.Item>)
                }
                )}
            </Menu>
        </div>
    )
}
export default DashboardSider
