import React, { useState, useEffect } from 'react';
import { db } from "../firebase/config";
import Swal from 'sweetalert2';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { Edit, Trash, PackagePlus, ChevronRight, ChevronLeft, Info } from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginatedProducts = products.slice(indexOfFirst, indexOfLast);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsCollectionRef = collection(db, 'productFood');
                const snapshot = await getDocs(productsCollectionRef);
                const productsList = snapshot.docs.map((doc, index) => ({ id: doc.id, ...doc.data(), index: index + 1 }));
                setProducts(productsList)
            } catch (error) {
                console.error("Error fetching users: ", error);
            }
        };
        fetchProducts();
    }, []);

    const handleAdd = async () => {
        Swal.fire({
            title: 'Thêm sản phẩm',
            html: `
                <label>Tên sản phẩm:</label><br>
                <input id="name" class="swal2-input" style="width: 80%;" /><br/>
                <label>Loại động vật:</label><br>
                <input id="animal" class="swal2-input" style="width: 80%;"  /><br/>
                <label>Mục tiêu:</label><br>
                <input id="goal" class="swal2-input" style="width: 80%;"  /><br/>
                <label>Trọng lượng một đơn vị (kg):</label><br>
                <input id="netWeight" type="number" class="swal2-input" style="width: 80%;"  /><br/>
                <label>Số lượng còn lại:</label><br>
                <input id="quatity" type="number" class="swal2-input" style="width: 80%;"  /><br/>
                <label>Giá:</label><br>
                <input id="price" type="number" class="swal2-input" style="width: 80%;"  /><br/>
                <label>Giảm giá (%):</label><br>
                <input id="discount" type="number" class="swal2-input" style="width: 80%;"  /><br/>
                <label>Mục đích:</label><br>
                <input id="target" class="swal2-input" style="width: 80%;"  /><br/>
                <label>Mô tả:</label><br>
                <textarea id="desc" class="swal2-textarea" style="width: 80%;"></textarea><br/>
                <label>Địa chỉ hình ảnh:</label><br>
                <input id="image" class="swal2-input" style="width: 80%;"  /><br/>
            `,
            showCancelButton: true,
            confirmButtonText: 'Lưu',
            cancelButtonText: 'Hủy',
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#name').value;
                const animal = Swal.getPopup().querySelector('#animal').value;
                const goal = Swal.getPopup().querySelector('#goal').value;
                const netWeight = parseFloat(Swal.getPopup().querySelector('#netWeight').value);
                const quatity = parseInt(Swal.getPopup().querySelector('#quatity').value);
                const price = parseInt(Swal.getPopup().querySelector('#price').value);
                const discount = parseInt(Swal.getPopup().querySelector('#discount').value);
                const target = Swal.getPopup().querySelector('#target').value;
                const desc = Swal.getPopup().querySelector('#desc').value;
                const image = Swal.getPopup().querySelector('#image').value;

                return { name, animal, goal, netWeight, quatity, price, discount, target, desc, image };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const newProduct = result.value;
                try {
                    // Cập nhật dữ liệu trong Firestore
                    await addDoc(collection(db, "productFood"), newProduct);
                    // Cập nhật state
                    setProducts([...products, { ...newProduct, index: products.length + 1 }]);
                    Swal.fire('Thành công!', 'Sản phẩm đã được thêm', 'success');
                } catch (error) {
                    console.error("Error updating product: ", error);
                    Swal.fire('Thất bại', 'Có lỗi xảy ra trong quá trình cập nhật', 'error');
                }
            }
        });
    }

    const handleInfo = (item) => {
        Swal.fire({
            title: 'Thông tin sản phẩm',
            html: `
                <div style="text-align: center;">
                    <img src="${item.image || 'https://via.placeholder.com/150'}" alt="Product Image" style="width: 150px; margin-top: 10px;" />
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Tên sản phẩm:</strong> 
                    <span>${item.name}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Loại động vật:</strong> 
                    <span>${item.animal}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Mục tiêu:</strong> 
                    <span>${item.goal}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Trọng lượng tịnh (kg):</strong> 
                    <span>${item.netWeight}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Số lượng còn lại:</strong> 
                    <span>${item.quatity}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Giá:</strong> 
                    <span>${item.price.toLocaleString()} VND</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Giảm giá:</strong> 
                    <span>${item.discount}%</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Mục đích:</strong> 
                    <span>${item.target}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong style="min-width: 100px; text-align: left">Mô tả:</strong>
                    <span style="text-align: justify;">${item.desc}</span>
                </div>  
            `,
            icon: 'info',
            confirmButtonText: 'Đóng'
        });
    };

    const handleEdit = async (item) => {
        Swal.fire({
            title: 'Chỉnh sửa thông tin sản phẩm',
            html: `
                <label>Tên sản phẩm:</label><br>
                <input id="name" class="swal2-input" style="width: 80%;" value="${item.name}" /><br/>
                <label>Loại động vật:</label><br>
                <input id="animal" class="swal2-input" style="width: 80%;" value="${item.animal}" /><br/>
                <label>Mục tiêu:</label><br>
                <input id="goal" class="swal2-input" style="width: 80%;" value="${item.goal}" /><br/>
                <label>Trọng lượng một đơn vị (kg):</label><br>
                <input id="netWeight" type="number" class="swal2-input" style="width: 80%;" value="${item.netWeight}" /><br/>
                <label>Số lượng còn lại:</label><br>
                <input id="quatity" type="number" class="swal2-input" style="width: 80%;" value="${item.quatity}" /><br/>
                <label>Hạn sử dụng:</label><br>
                <input type="number" class="swal2-input" style="width: 80%;" value="" /><br/>
                <label>Giá:</label><br>
                <input id="price" type="number" class="swal2-input" style="width: 80%;" value="${item.price}" /><br/>
                <label>Giảm giá (%):</label><br>
                <input id="discount" type="number" class="swal2-input" style="width: 80%;" value="${item.discount}" /><br/>
                <label>Mục đích:</label><br>
                <input id="target" class="swal2-input" style="width: 80%;" value="${item.target}" /><br/>
                <label>Mô tả:</label><br>
                <textarea id="desc" class="swal2-textarea" style="width: 80%;">${item.desc}</textarea><br/>
                <label>Địa chỉ hình ảnh:</label><br>
                <input id="image" class="swal2-input" style="width: 80%;" value="${item.image || ''}" /><br/>
            `,
            showCancelButton: true,
            confirmButtonText: 'Lưu',
            cancelButtonText: 'Hủy',
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#name').value;
                const animal = Swal.getPopup().querySelector('#animal').value;
                const goal = Swal.getPopup().querySelector('#goal').value;
                const netWeight = parseFloat(Swal.getPopup().querySelector('#netWeight').value);
                const quatity = parseInt(Swal.getPopup().querySelector('#quatity').value);
                const price = parseInt(Swal.getPopup().querySelector('#price').value);
                const discount = parseInt(Swal.getPopup().querySelector('#discount').value);
                const target = Swal.getPopup().querySelector('#target').value;
                const desc = Swal.getPopup().querySelector('#desc').value;
                const image = Swal.getPopup().querySelector('#image').value;

                return { name, animal, goal, netWeight, quatity, price, discount, target, desc, image };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedData = result.value;
                try {
                    // Cập nhật dữ liệu trong Firestore
                    await updateDoc(doc(db, "productFood", item.id), updatedData);
                    // Cập nhật state
                    setProducts(products.map((prod) => (prod.id === item.id ? { ...prod, ...updatedData } : prod)));

                    Swal.fire('Thành công!', 'Sản phẩm đã được cập nhật.', 'success');
                } catch (error) {
                    console.error("Error updating product: ", error);
                    Swal.fire('Thất bại', 'Có lỗi xảy ra trong quá trình cập nhật', 'error');
                }
            }
        });
    };

    const handleDelete = async (item) => {
        Swal.fire({
            title: `Xác nhận?`,
            text: `Xác nhận xóa ${item.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteDoc(doc(db, "productFood", item.id));
                    setProducts(products.filter(i => i.id !== item.id));
                    Swal.fire('Thành công!', 'Sản phẩm này đã xóa', 'success');
                } catch (error) {
                    console.error("Error deleting user: ", error);
                    Swal.fire('Thất bại', 'Đã xảy ra lỗi nào đó', 'error');

                }
            }
        });
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(products.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={styles.text}>Quản lý sản phẩm</h1>
                <button style={styles.addButton} onClick={() => handleAdd()}><PackagePlus size={16} />Thêm sản phẩm mới</button>
            </div>

            <h3 style={{ alignSelf: 'flex-start', color: '#807F7F' }}>Có {paginatedProducts.length} sản phẩm trong trang này</h3>

            {paginatedProducts.length === 0 ? (
                <h1>Không tìm thấy sản phẩm nào</h1>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableRow}>
                            <th>#</th>
                            <th>Hình đại diện</th>
                            <th>Tên sản phẩm</th>
                            <th>Mục đích sản phẩm</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.map(item => (
                            <tr key={item.id} style={styles.tableRow}>
                                <td>{item.index}</td>
                                <td>
                                    <img
                                        src={item.image || "https://via.placeholder.com/32"}
                                        alt={item.name}
                                        style={styles.avatar}
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/32"; }}
                                    />
                                </td>
                                <td style={styles.text}>{item.name}</td>
                                <td style={styles.text}>{item.target}</td>
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
                    {Array.from({ length: Math.ceil(products.length / itemsPerPage) }, (_, index) => (
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
                <button style={styles.btnNavigationPage} onClick={handleNextPage} disabled={currentPage === Math.ceil(products.length / itemsPerPage)}>
                    <ChevronRight size={25} />
                </button>
            </div>
        </div>
    );
};

export default Products;

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
        width: '80px',
        height: '80px',
    },
    actions: {
        display: 'flex',
        justifyContent: 'center',
        height: '80px',
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