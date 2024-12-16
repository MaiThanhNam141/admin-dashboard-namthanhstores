import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Edit, Trash, UserPlus, ChevronRight, ChevronLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Staff = () => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'users');
                const staffQuery = query(usersCollection, where('staff', '!=', null)); 
                const snapshot = await getDocs(staffQuery)
                const userList = snapshot.docs.map((doc, index) => ({ id: doc.id, ...doc.data(), index: index + 1 }));
                setStaffs(userList);
            } catch (error) {
                console.error("Error fetching staffs: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const paginatedUsers = staffs.slice(indexOfFirstUser, indexOfLastUser);

    const handleNextPage = () => {
        if (currentPage < Math.ceil(staffs.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleAddNewStaff = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Thêm nhân viên mới',
            icon: 'info',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Thêm',
            html:
                `<div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Link Avatar</label>
                    <input id="swal-input1" class="swal2-input" placeholder="Link Avatar" style="width: 80%;">
                </div>` +
                `<div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Name</label>
                    <input id="swal-input2" class="swal2-input" placeholder="Name" style="width: 80%;">
                </div>` +
                `<div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Email</label>
                    <input id="swal-input3" class="swal2-input" placeholder="Email" style="width: 80%;">
                </div>` +
                `<div style="text-align: left; margin-bottom: 10px; position: relative; justifyContent: 'center'; alignItems: 'center',">
                    <label style="display: block; font-weight: bold;">Mật khẩu</label>
                    <input id="swal-input4" type="password" class="swal2-input" placeholder="Mật khẩu" style="width: 80%; padding-right: 30px;">
                </div>`,
            focusConfirm: false,
            preConfirm: () => {
                const photoURL = Swal.getPopup().querySelector('#swal-input1').value;
                const displayName = Swal.getPopup().querySelector('#swal-input2').value;
                const email = Swal.getPopup().querySelector('#swal-input3').value;
                const password = Swal.getPopup().querySelector('#swal-input4').value;
                return { photoURL, displayName, email, password };
            }
        });

        if (formValues) {
            const { photoURL, displayName, email, password } = formValues;
            const auth = getAuth();

            try {
                // Create user with Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Update user profile with display name and photo URL
                await updateProfile(user, { displayName, photoURL });

                // Save user data in Firestore without the password
                const newUser = { photoURL, displayName, email, uid: user.uid };
                const docRef = await addDoc(collection(db, 'users'), newUser);

                setStaffs([...staffs, { ...newUser, id: docRef.id, index: staffs.length + 1 }]);
                Swal.fire('Thành công!', 'nhân viên đã được thêm.', 'success');
            } catch (error) {
                console.error("Error adding user: ", error);
                Swal.fire('Lỗi', 'Không thể thêm nhân viên.', 'error');
            }
        }
    };


    const handleEditStaff = async (user) => {
        const { value: formValues } = await Swal.fire({
            title: 'Sửa thông tin nhân viên',
            icon: 'question',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            html:
                `<div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Link Avatar</label>
                    <input id="swal-input1" class="swal2-input" value="${user.photoURL}" placeholder="Link Avatar" style="width: 80%;">
                </div>` +
                `<div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Name</label>
                    <input id="swal-input2" class="swal2-input" value="${user.displayName}" placeholder="Name" style="width: 80%;">
                </div>` +
                `<div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Quyền nhân viên</label>
                    <input id="swal-input3" type="checkbox" ${user.staff ? 'checked' : ''} style="transform: scale(1.5); margin-left: 10px;">
                </div>`,
            focusConfirm: false,
            preConfirm: () => {
                const photoURL = Swal.getPopup().querySelector('#swal-input1').value;
                const displayName = Swal.getPopup().querySelector('#swal-input2').value;
                const staff = Swal.getPopup().querySelector('#swal-input3').checked;
                return { photoURL, displayName, staff };
            }
        });

        if (formValues) {
            try {
                const { photoURL, displayName, staff } = formValues;
                
                if (currentUser.email !== 'maithanhnam@gmail.com') {
                    Swal.fire('Thất bại!', 'Bạn không có quyền chỉnh sửa thông tin này', 'error');
                    return;
                }

                if (user.email === 'maithanhnam@gmail.com' && currentUser.email === 'maithanhnam@gmail.com') {
                    Swal.fire('Thất bại!', 'Bạn không thể xóa quyền admin của chính mình', 'error');
                    return;
                }
                // Cập nhật tài liệu Firestore của nhân viên
                await updateDoc(doc(db, "users", user.id), { photoURL, displayName, staff });
                Swal.fire('Thành công!', 'Cập nhật dữ liệu tài khoản thành công', 'success');

                // Cập nhật state trong React
                setStaffs(staffs.map(u => u.id === user.id ? { ...u, photoURL, displayName, staff } : u));
            } catch (error) {
                console.error("Error updating user: ", error);
                Swal.fire('Thất bại!', 'Đã xảy ra lỗi nào đó', 'error');
            }
        }
    };


    const handleDeleteStaff = async (user) => {
        Swal.fire({
            title: `Xác nhận?`,
            text: `Xác nhận xóa ${user.displayName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteDoc(doc(db, "users", user.id));
                    setStaffs(staffs.filter(u => u.id !== user.id));
                    Swal.fire('Thành công!', 'nhân viên này đã bị xóa', 'success');
                } catch (error) {
                    console.error("Error deleting user: ", error);
                    Swal.fire('Thất bại', 'Đã xảy ra lỗi nào đó', 'error');
                }
            }
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={styles.text}>Quản lý nhân viên</h1>
                <button style={styles.addButton} onClick={() => handleAddNewStaff()}><UserPlus size={16} /> Add User</button>
            </div>

            <h3 style={{ alignSelf: 'flex-start', color: '#807F7F' }}>Có {paginatedUsers.length} nhân viên trong trang này</h3>

            {paginatedUsers.length === 0 ? (
                <h1>Không tìm thấy nhân viên nào</h1>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableRow}>
                            <th>#</th>
                            <th>Hình đại diện</th>
                            <th>Tên hiển thị</th>
                            <th>Email</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map(item => (
                            <tr key={item.id} style={styles.tableRow}>
                                <td>{item.index}</td>
                                <td>
                                    <img
                                        src={item.photoURL || "https://via.placeholder.com/32"}
                                        alt={`${item.displayName}'s avatar`}
                                        style={styles.avatar}
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/32"; }}
                                    />
                                </td>
                                <td style={styles.text}>{item.displayName}</td>
                                <td style={styles.text}>{item.email}</td>
                                <td style={styles.actions}>
                                    <button style={styles.actionButton} onClick={() => handleEditStaff(item)}>
                                        <Edit size={20} color='black' />
                                    </button>
                                    <button style={styles.actionButton} onClick={() => handleDeleteStaff(item)}>
                                        <Trash size={20} color='red' />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div style={styles.pagination}>
                <button style={styles.btnNavigationPage} onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <ChevronLeft size={25} />
                </button>
                <div>
                    {Array.from({ length: Math.ceil(staffs.length / itemsPerPage) }, (_, index) => (
                        <span key={index} style={{
                            border: '2px solid #000',
                            color: '#000',
                            backgroundColor: '#f9f9f9',
                            padding: '5px 10px',
                            display: 'inline-block',
                            margin: '0 5px',
                            cursor: 'pointer'
                        }}
                            onClick={() => setCurrentPage(index + 1)}>
                            {index + 1}
                        </span>
                    ))}
                </div>
                <button style={styles.btnNavigationPage} onClick={handleNextPage} disabled={currentPage === Math.ceil(staffs.length / itemsPerPage)}>
                    <ChevronRight size={25} />
                </button>
            </div>
        </div>
    );
};

export default Staff;

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '20px',
        height: '100%',
        minHeight: '100vh',
    },
    text: {
        color: '#000',
    },
    addButton: {
        marginTop: '10px',
        marginBottom: '20px',
        padding: '8px 16px',
        borderColor: '#4CAF50',
        color: 'black',
        backgroundColor: '#f7f7f7',
        border: '10',
        borderRadius: '4px',
        cursor: 'pointer',
        alignItems: 'center',
    },
    table: {
        width: '100%',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 150px)',
    },
    tableRow: {
        minHeight: '50px',
        textAlign: 'center',
        borderBottom: '1px solid #ccc',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
    },
    actions: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        height: '32px'
    },
    actionButton: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        width: '50%',
    },
    btnNavigationPage: {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width: '50px',
        height: '80px',
        cursor: 'pointer',
        border: '0px'
    }
};
