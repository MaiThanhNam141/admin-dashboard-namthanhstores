import React, { useState, useEffect } from 'react';
import { db } from "../firebase/config";
import Swal from 'sweetalert2';
import { collection, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Edit, Trash, ChevronRight, ChevronLeft, Info } from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginatedOrders = orders.slice(indexOfFirst, indexOfLast);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersCollectionRef = collection(db, 'orders');
                const snapshot = await getDocs(ordersCollectionRef);
    
                const orderList = snapshot.docs.map(async (orderDoc, index) => {
                    const orderData = orderDoc.data();
                    
                    // Lấy email từ embed_data
                    const email = orderData.embed_data && orderData.embed_data.email ? orderData.embed_data.email : "Không có email";
    
                    // Lấy tên sản phẩm từ itemData
                    const itemNames = await Promise.all(orderData.item.map(async (product) => {
                        const productDoc = await getDoc(doc(db, "productFood", product.id)); // Lấy thông tin sản phẩm
                        return productDoc.exists() ? productDoc.data().name : "Không tìm thấy sản phẩm";
                    }));
    
                    return {
                        id: orderDoc.id,
                        ...orderData,
                        email: email, // Email lấy từ embed_data
                        amount_formated: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderData.amount),
                        server_time_formated: new Date(orderData.server_time).toLocaleString(),
                        itemData: itemNames, // Lưu tên sản phẩm
                        index: index + 1,
                    };
                });
                
                // Chờ tất cả các promise hoàn thành
                const ordersData = await Promise.all(orderList);
                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders: ", error);
            }
        };
        
        fetchOrders();
    }, []);

    const handleNextPage = () => {
        if (currentPage < Math.ceil(orders.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleInfo = (item) => { 
        Swal.fire({
            title: 'Thông tin về đơn hàng',
            html: `
                <div style="display: flex; justify-content: space-between;">
                    <strong>Mã đơn hàng:</strong> 
                    <span>${item.app_trans_id}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Người dùng:</strong> 
                    <span>${item.app_user}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Số tiền:</strong> 
                    <span>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Giảm giá:</strong> 
                    <span>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.discount_amount)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Phí người dùng:</strong> 
                    <span>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.user_fee_amount)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Kênh:</strong> 
                    <span>${item.channel}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Thời gian server:</strong> 
                    <span>${new Date(item.server_time).toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Mã giao dịch ZP:</strong> 
                    <span>${item.zp_trans_id}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>ID người dùng ZP:</strong> 
                    <span>${item.zp_user_id}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Dữ liệu nhúng:</strong> 
                    <span>${item.embed_data}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Thông tin mặt hàng:</strong> 
                    <span>${item.itemData}</span>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Đóng'
        });
    };
    
    const handleEdit = (item) => {
        Swal.fire({
            title: 'Chỉnh sửa thông tin đơn hàng',
            html: `
                <label>Số tiền:</label><br>
                <input id="amount" type="number" class="swal2-input" style="width: 80%;" value="${item.amount}" disabled /><br/>
                <label>Giảm giá:</label><br>
                <input id="discount_amount" type="number" class="swal2-input" style="width: 80%;" value="${item.discount_amount}" disabled /><br/>
                <label>Phí người dùng:</label><br>
                <input id="user_fee_amount" type="number" class="swal2-input" style="width: 80%;" value="${item.user_fee_amount}" disabled /><br/>
                <label>Kênh:</label><br>
                <input id="channel" type="number" class="swal2-input" style="width: 80%;" value="${item.channel}" disabled /><br/>
                <label>Thời gian server:</label><br>
                <input id="server_time" type="number" class="swal2-input" style="width: 80%;" value="${item.server_time}" disabled /><br/>
                <label>Dữ liệu nhúng:</label><br>
                <textarea id="embed_data" class="swal2-textarea" style="width: 80%;">${item.embed_data}</textarea><br/>
                <label>Thông tin mặt hàng:</label><br>
                <div id="item-list" style="max-height: 150px; overflow-y: auto;">
                    ${item.itemData.map(productId => `
                        <div style="margin: 5px 0;">
                            <span style="cursor: pointer; color: blue;" onclick="handleInfoProduct('${productId}')">
                                ${productId} <!-- Thay thế ID bằng tên sản phẩm từ fetch -->
                            </span>
                        </div>
                    `).join('')}
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Lưu',
            cancelButtonText: 'Hủy',
            preConfirm: () => {
                const embed_data = Swal.getPopup().querySelector('#embed_data').value;
                return { embed_data };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedData = result.value;
                try {
                    // Cập nhật dữ liệu trong Firestore
                    await updateDoc(doc(db, "orders", item.id), updatedData);
                    // Cập nhật state
                    setOrders(orders.map((ord) => (ord.id === item.id ? { ...ord, ...updatedData } : ord)));
    
                    Swal.fire('Thành công!', 'Đơn hàng đã được cập nhật.', 'success');
                } catch (error) {
                    console.error("Error updating order: ", error);
                    Swal.fire('Thất bại', 'Có lỗi xảy ra trong quá trình cập nhật', 'error');
                }
            }
        });
    };    

    const handleDelete = async (item) => {
        Swal.fire({
            title: `Xác nhận?`,
            text: `Xác nhận xóa ${item.id}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteDoc(doc(db, "orders", item.id));
                    setOrders(orders.filter(order => order.id !== item.id));
                    Swal.fire('Thành công!', 'Sản phẩm này đã xóa', 'success');
                } catch (error) {
                    console.error("Error deleting user: ", error);
                    Swal.fire('Thất bại', 'Đã xảy ra lỗi nào đó', 'error');
                }
            }
        });
    };

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={styles.text}>Quản lý đơn hàng</h1>
            </div>

            <h3 style={{ alignSelf: 'flex-start', color: '#807F7F' }}>Có {paginatedOrders.length} đơn hàng trong trang này</h3>

            {paginatedOrders.length === 0 ? (
                <h1>Không tìm thấy đơn hàng nào</h1>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableRow}>
                            <th>#</th>
                            <th>ID đơn hàng</th>
                            <th>Email người mua</th>
                            <th>Số tiền</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map(item => (
                            <tr key={item.id} style={styles.tableRow}>
                                <td>{item.index}</td>
                                <td style={styles.text}>{item.id}</td>
                                <td style={styles.text}>{item.email}</td>
                                <td style={styles.text}>{item.amount_formated}</td>
                                <td style={styles.actions}>
                                    <button style={styles.actionButton} onClick={() => handleInfo(item)}>
                                        <Info size={20} color='blue' />
                                    </button>
                                    <button style={styles.actionButton} onClick={() => handleEdit(item)}>
                                        <Edit size={20} color='black' />
                                    </button>
                                    <button style={styles.actionButton} onClick={() => handleDelete(item)}>
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
                    {Array.from({ length: Math.ceil(orders.length / itemsPerPage) }, (_, index) => (
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
                <button style={styles.btnNavigationPage} onClick={handleNextPage} disabled={currentPage === Math.ceil(orders.length / itemsPerPage)}>
                    <ChevronRight size={25} />
                </button>
            </div>
        </div>
    );
};

export default Orders;

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
    actions: {
        display: 'flex',
        justifyContent: 'center',
        height: '35px',
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