import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useDeleteProductMutation, useGetSingleProductQuery, useUpdateProductMutation } from "../../../redux/api/productAPI";
import { useSelector } from "react-redux";
import { UserReducerInitialState } from "../../../types/reducer-types";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CustomError } from "../../../types/api-types";
import { Skeleton } from "../../../components/loader";
import { server } from "../../../redux/store";
import { responseToast } from "../../../utils/features";


const Productmanagement = () => {
  
  const {user} = useSelector((state: {userReducer: UserReducerInitialState}) => state?.userReducer);
  
  const {id} = useParams();
  
  const {data, isLoading, isError, error} = useGetSingleProductQuery({productId: id!, adminId: user?._id!});
  
  if (isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }
  
  const navigate = useNavigate();
  
  const { name, price, stock, category, photo } = data?.product || {
    name: "",
    price: 0,
    stock: 0,
    category: "",
    photo: ""
  };

  const [nameUpdate, setNameUpdate] = useState<string>(name); 
  const [priceUpdate, setPriceUpdate] = useState<number>(price);
  const [stockUpdate, setStockUpdate] = useState<number>(stock);
  const [categoryUpdate, setCategoryUpdate] = useState<string>(category);
  const [photoUpdate, setPhotoUpdate] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File>();

 
  
  const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file: File | undefined = e.target.files?.[0];
 
    const reader: FileReader = new FileReader();
    
    if (file) {
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPhotoUpdate(reader.result);
          setPhotoFile(file);
        }
      };
    }
  };
  
  const [upadteProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    
    e.preventDefault();

    if(!nameUpdate || !categoryUpdate || !priceUpdate || !stockUpdate){
      return toast.error('All fields are required');
    }

    const formData = new FormData();

    if(nameUpdate) formData.set("name", nameUpdate);
    if(categoryUpdate) formData.set("category", categoryUpdate);
    if(priceUpdate) formData.set("price", priceUpdate.toString());
    if(stockUpdate !== undefined) formData.set("stock", stockUpdate.toString());
    if(photoFile) formData.set("photo", photoFile);

    const res = await upadteProduct({productId: data?.product?._id!, adminId: user?._id!, formData});

    responseToast(res, navigate, "/admin/product");
  }; 

  const deleteHandler = async () => {
    const res = await deleteProduct({adminId: user?._id!, productId: data?.product?._id!});

    responseToast(res, navigate, "/admin/product");
  }; 

  useEffect(() => {
    setNameUpdate(data?.product?.name!);
    setPriceUpdate(data?.product?.price!);
    setStockUpdate(data?.product?.stock!);
    setCategoryUpdate(data?.product?.category!);
  },[data])

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        {
          isLoading ? <Skeleton length={20} /> : ( <>
            <section>
          <strong>ID - {data?.product?._id}</strong>
          <img src={`${server}/${photo}`} alt="Product" />
          <p>{name}</p>
          {stock > 0 ? (
            <span className="green">{stock} Available</span>
          ) : (
            <span className="red"> Not Available</span>
          )}
          <h3>₹ {price}</h3>
        </section>
        <article>
          <button className="product-delete-btn" onClick={deleteHandler}>
            <FaTrash />
          </button>
          <form onSubmit={submitHandler}>
            <h2>Manage</h2>
            <div>
              <label>Name</label>
              <input
                type="text"
                placeholder="Name"
                value={nameUpdate}
                onChange={(e) => setNameUpdate(e.target.value)}
              />
            </div>
            <div>
              <label>Price</label>
              <input
                type="number"
                placeholder="Price"
                value={priceUpdate}
                onChange={(e) => setPriceUpdate(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Stock</label>
              <input
                type="number"
                placeholder="Stock"
                value={stockUpdate}
                onChange={(e) => setStockUpdate(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Category</label>
              <input
                type="text"
                placeholder="eg. laptop, camera etc"
                value={categoryUpdate}
                onChange={(e) => setCategoryUpdate(e.target.value)}
              />
            </div>

            <div>
              <label>Photo</label>
              <input type="file" onChange={changeImageHandler} />
            </div>
           
            {photoUpdate && <img src={photoUpdate} alt="New Image" />}
            <button type="submit">Update</button>
          </form>
        </article>
          </>)
        }
      </main>
    </div>
  );
};

export default Productmanagement;
