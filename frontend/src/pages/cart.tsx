import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
import { Link } from "react-router-dom";
import CartItemCard from "../components/cart-item";
import { useDispatch, useSelector } from "react-redux";
import { CartReducerInitialState } from "../types/reducer-types";
import { CartItem } from "../types/types";
import { addToCart, calculatePrice, discountApplied, removeCartItem } from "../redux/reducer/cartReducer";
import axios from "axios";
import { server } from "../redux/store";

const Cart = () => {
  const dispatch = useDispatch();

  const { cartItems, subtotal, tax, total, shippingCharges, discount } =
    useSelector(
      (state: { cartReducer: CartReducerInitialState }) => state.cartReducer
    );

  const incrementHandler = (cartItem: CartItem) => {
    if(cartItem?.stock <= cartItem.quantity) return;
    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity + 1 }));
  };

  const decrementHandler = (cartItem: CartItem) => {
    if(cartItem?.quantity <= 1) return;
    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity - 1 }));
  };

  const removeHandler = (productId: string) => {
     dispatch(removeCartItem(productId));
  };

  const [couponCode, setCouponCode] = useState<string>("");
  const [isValidcouponCode, setIsValidCouponCode] = useState<boolean>(false);

  useEffect(() => {
    const getDiscount = async (coupon = couponCode) => {
      try {
        const res = await axios.get(`${server}/api/v1/coupon/discount?coupon=${coupon}`);
        dispatch(discountApplied(res?.data?.amount));
        dispatch(calculatePrice());
        setIsValidCouponCode(true) 
      } catch (error) {
        dispatch(discountApplied(0))
        dispatch(calculatePrice());
        setIsValidCouponCode(false);
      }
  
    }

    getDiscount(couponCode)
    
  }, [couponCode]);


  useEffect(() => {
    dispatch(calculatePrice())
  }, cartItems)

  return (
    <div className="cart">
      <main>
        {cartItems?.length ? (
          cartItems.map((item) => (
            <CartItemCard
              key={item?.productId}
              cartItem={item}
              incrementHandler={incrementHandler}
              decrementHandler={decrementHandler}
              removeHandler={removeHandler}
            />
          ))
        ) : (
          <h1>No Items Added</h1>
        )}
      </main>
      <aside>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Shipping Charges: ₹{shippingCharges}</p>
        <p>Tax: ₹{tax}</p>
        <p>
          Discount: <em className="red"> - ₹{discount}</em>
        </p>
        <p>
          <b>Total: ₹{total}</b>
        </p>

        <input
          type="text"
          placeholder="Coupon Code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />

        {couponCode &&
          (isValidcouponCode ? (
            <span className="green">
              ₹{discount} off using the <code>{couponCode}</code>
            </span>
          ) : (
            <span className="red">
              Invalid Coupon <VscError />
            </span>
          ))}

        {cartItems?.length ? <Link to="/shipping">Checkout</Link> : ""}
      </aside>
    </div>
  );
};

export default Cart;
