import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, Outlet } from 'react-router-dom';
import Logo from "../assets/logo.png";
import Sidebar from '../component/Sidebar';
import { auth } from "../firebase/config"
import { signOut } from '@firebase/auth';

const Dashboard = () => {
  const { currentUser, dispatch } = useContext(AuthContext);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: "LOGOUT" });
      console.log("Done");

    } catch (error) {

    }
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#f7f7f7', color: '#F9FAFB', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Navbar */}
        <div style={{ width: '100%', backgroundColor: '#DEFFD3', color: '#3E3E3E', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', borderRadius: 5 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <img src={Logo} alt="Logo" style={{ height: '2.5rem' }} />
              <span style={{ marginLeft: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>Trang chủ</span>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {currentUser && (
              <>
                <span>{currentUser.email}</span>
                <button
                  onClick={handleLogout}
                  style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.25rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', marginRight: '30px' }}
                >
                  Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '1.5rem', backgroundColor: '#f7f7f7', height: '100vh' }}>
          <Outlet /> {/* This will render the nested routes */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
