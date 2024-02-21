import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { Skeleton } from "../components/loader";
import { useOrderDetailsQuery } from "../redux/api/orderAPI";
import { server } from "../redux/store";
import { CustomError } from "../types/api-types";
import { Order, OrderItem } from "../types/types";

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

const OrderDetails = () => {

  const { id } = useParams();

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

  return (
    <div className="admin-container">
      {/* <main className="product-management"> */}
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
            </article>
          </>
        )}
      {/* </main> */}
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

export default OrderDetails;
