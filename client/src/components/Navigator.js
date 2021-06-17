import React, { useState, useEffect } from 'react'
import { Menu } from 'antd';
import { HomeOutlined, DashboardOutlined, LoginOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useHistory } from "react-router-dom";
import '../css/Navigator.css'
import cookies from 'react-cookies'
const { SubMenu } = Menu;

const Navigator = (props) => {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [current, setCurrent] = useState("/");


  const logout = () => {
    var keys = Object.keys(cookies.loadAll())
    console.log(keys)
    keys.forEach(key => {
      cookies.remove(key)
    })
    history.push('/')
    window.location.reload()
  }

  const handleClick = e => {
    let path = e.key
    setCurrent(path)
    if (path === '/')
      history.push('/')
    else if (path === 'logout')
      logout()
    else history.push('/' + path)

  }
  useEffect(() => {
    let token = cookies.load('jwt')
    if (token !== undefined) {
      setUsername(cookies.load('username'))
    }

  })
  return (
    <Menu onClick={handleClick} selectedKeys={[current]} mode="horizontal">
      <Menu.Item key="/" >
        <img className="logo" src="./images/logo.png" />
      </Menu.Item>
      {username === '' ? <Menu.Item key="home" icon={<HomeOutlined />}>
        Home
      </Menu.Item> : <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
        Dashboard
      </Menu.Item>}

      <Menu.Item key="about" >
        About
      </Menu.Item>
      <SubMenu key="SubMenu" disabled title="Navigation Three - Submenu">
        <Menu.ItemGroup title="Item 1">
          <Menu.Item key="setting:1">Option 1</Menu.Item>
          <Menu.Item key="setting:2">Option 2</Menu.Item>
        </Menu.ItemGroup>
        <Menu.ItemGroup title="Item 2">
          <Menu.Item key="setting:3">Option 3</Menu.Item>
          <Menu.Item key="setting:4">Option 4</Menu.Item>
        </Menu.ItemGroup>
      </SubMenu>
      {cookies.load('jwt') === undefined ? (
        <Menu.Item key="login" icon={<LoginOutlined />}>
          Đăng nhập
        </Menu.Item>
      ) : (
        <>
          <Menu.Item key="profile" icon={<UserOutlined />}>
            {username}
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />}>
            Đăng xuất
          </Menu.Item>
        </>
      )}


    </Menu>
  );
}
export default Navigator


