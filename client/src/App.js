import "antd/dist/antd.css";
import { Layout } from "antd";
import './App.css';
import { BrowserRouter, Route } from "react-router-dom";
import Navigator from "./components/Navigator"
import HomePage from "./pages/HomePage"
import DashboardPage from "./pages/DashboardPage"
import ActiveAccountPage from "./pages/ActiveAccountPage"
import LoginPage from "./pages/LoginPage";
const { Header, Footer, Content } = Layout;

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Header className="header-wrapper">
        <Navigator />
        </Header>
        <Content className="content-wrapper">
          <Route exact path='/'>
            <HomePage />
          </Route>
          <Route path='/dashboard'>
            <DashboardPage />
          </Route>
          <Route exact path='/login'>
            <LoginPage />
          </Route>
          <Route path='/login/active'>
            <ActiveAccountPage />
          </Route>
        </Content>
      </Layout>
      <Footer>
        <h1>Copyright © 2021 SunPear</h1>
      </Footer>
    </BrowserRouter>
  );
}

export default App;
