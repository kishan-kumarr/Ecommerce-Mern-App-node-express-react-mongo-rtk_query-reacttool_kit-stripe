import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useDeleteOrderMutation, useModifyOrderMutation, useOrderDetailsQuery } from "../../../redux/api/orderAPI";
import { server } from "../../../redux/store";
import { CustomError } from "../../../types/api-types";
import { UserReducerInitialState } from "../../../types/reducer-types";
import { Order, OrderItem } from "../../../types/types";
import { Skeleton } from "../../../components/loader";
import { responseToast } from "../../../utils/features";

const defaulData: Order = {
  shippingInfo: {
    address: "",
    city: "",
    country: "",
    pinCode: "",
    state: "",
  },
  status: "",
  subtotal: 0,
  discount: 0,
  shippingCharges: 0,
  tax: 0,
  total: 0,
  orderItems: [],
  user: { name: "", _id: "" },
  _id: "",
};

const TransactionManagement = () => {

  const [modifyOrder] = useModifyOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const { user } = useSelector(
    (state: { userReducer: UserReducerInitialState }) => state?.userReducer
  );

  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useOrderDetailsQuery(id!);

  if (isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }

  const {
    shippingInfo: { address, city, state: orderStatus, pinCode, country },
    orderItems,
    user: { name },
    subtotal,
    discount,
    tax,
    total,
    status,
    shippingCharges,
  } = data?.order || defaulData;

  const updateHandler = async () => {
    const res = await modifyOrder({
      adminId: user?._id!,
      orderId: data?.order?._id!
    });

    responseToast(res, navigate, "/admin/transaction");
  };

  const deleteHandler = async () => {
    const res = await deleteOrder({
      adminId: user?._id!,
      orderId: data?.order?._id!
    });

    responseToast(res, navigate, "/admin/transaction")
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        {isLoading ? (
          <Skeleton length={20} />
        ) : (
          <>
            <section
              style={{
                padding: "2rem",
              }}
            >
              <h2>Order Items</h2>

              {orderItems.map((i) => (
                <ProductCard
                  key={i._id}
                  name={i.name}
                  photo={`${server}/${i.photo}`}
                  productId={i.productId}
                  _id={i._id}
                  quantity={i.quantity}
                  price={i.price}
                />
              ))}
            </section>

            <article className="shipping-info-card">
              <button className="product-delete-btn" onClick={deleteHandler}>
                <FaTrash />
              </button>
              <h1>Order Info</h1>
              <h5>User Info</h5>
              <p>Name: {name}</p>
              <p>
                Address:{" "}
                {`${address}, ${city}, ${status}, ${country} ${pinCode}`}
              </p>
              <h5>Amount Info</h5>
              <p>Subtotal: {subtotal}</p>
              <p>Shipping Charges: {shippingCharges}</p>
              <p>Tax: {tax}</p>
              <p>Discount: {discount}</p>
              <p>Total: {total}</p>

              <h5>Status Info</h5>
              <p>
                Status:{" "}
                <span
                  className={
                    status === "Delivered"
                      ? "purple"
                      : status === "Shipped"
                      ? "green"
                      : "red"
                  }
                >
                  {status}
                </span>
              </p>
              <button className="shipping-btn" onClick={updateHandler}>
                Process Status
              </button>
            </article>
          </>
        )}
      </main>
    </div>
  );
};

const ProductCard = ({
  name,
  photo,
  price,
  quantity,
  productId,
}: OrderItem) => (
  <div className="transaction-product-card">
    <img src={photo} alt={name} />
    <Link to={`/product/${productId}`}>{name}</Link>
    <span>
      ₹{price} X {quantity} = ₹{price * quantity}
    </span>
  </div>
);

export default TransactionManagement;
