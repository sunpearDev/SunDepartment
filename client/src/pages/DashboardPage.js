import React, { useState,useEffect } from 'react'
import { Layout } from "antd";
import DashboardSider from '../components/DashboardSider'
import DashboardContent from '../components/DashboardContent';
const { Sider, Content } = Layout;

const DashboardPage = (props) => {
    const [menu,setMenu]=useState('')
    const [category,setCategory] =useState('')
    const recieveMenu=(path)=>{
        setMenu(path)
        
    }
    const recieveCategory=(cat)=>{
        setCategory(cat)
    }
    //useEffect(())
    return (
        <Layout>
            <Sider className="side-left">
                <DashboardSider menu={recieveMenu} category={recieveCategory}/>
            </Sider>
            <Content>
                <DashboardContent menu={menu} category={category}/>
            </Content>
        </Layout>
    )

}
export default DashboardPage
