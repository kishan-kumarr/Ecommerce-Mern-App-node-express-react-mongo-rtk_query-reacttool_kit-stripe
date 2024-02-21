import { Link } from "react-router-dom";
import ProductCard from "../components/product-card";
import { useLatestProductsQuery } from "../redux/api/productAPI";
import toast from "react-hot-toast";
import { Skeleton } from "../components/loader";
import { CartItem } from "../types/types";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/reducer/cartReducer";

const Home = () => {

  const dispatch = useDispatch();

  const {data, isLoading, isError} = useLatestProductsQuery("");
  
  const addToCartHandler = ( cartItem: CartItem) => {
    if(cartItem?.stock < 1){
      toast.error("Product Out of stock");
    } 

    dispatch(addToCart(cartItem));
    toast.success("Product added into cart")
  }

  if(isError){
    toast.error("Error while trying to fetch products");
  }

  return (    
    <div className="home">
      <section></section>
      <h1>
        Latest Products
        <Link to="/search" className="findmore">
          More
        </Link>
      </h1>

      <main>     
      {
        isLoading ? 
        <Skeleton /> :
        data?.products && data?.products.map( (item) => (
          <ProductCard 
                key= {item?._id}
                photo= {item?.photo}
                name= {item?.name}
                price= {item?.price}
                productId= {item?._id}
                stock= {item?.stock}
                handler= {addToCartHandler}
            />  
        ))
      }
            
      </main>
    </div>
  )
};

export default Home;
