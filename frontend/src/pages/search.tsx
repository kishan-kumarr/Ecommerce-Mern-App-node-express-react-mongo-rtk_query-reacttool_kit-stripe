import { useState } from "react";
// import { Skeleton } from "../components/Loader";
import ProductCard from "../components/product-card";
import { useCategoriesQuery, useSearchProductsQuery } from "../redux/api/productAPI";
import toast from "react-hot-toast";
import { CustomError } from "../types/api-types";
import { Skeleton } from "../components/loader";
import { CartItem } from "../types/types";
import { addToCart } from "../redux/reducer/cartReducer";
import { useDispatch } from "react-redux";

const Search = () => {

  const dispatch = useDispatch();
 
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);


  const {isLoading: productLoading, data: searchedData, isError: productIsError, error: productError} = useSearchProductsQuery({
    search,
    sort,
    category,
    page,
    price: maxPrice
  });


  if (productIsError) {
    const err = productError as CustomError;
    toast.error(err.data.message);
  }


  const {data: categoriesResponse, isLoading: categoryLoading, isError, error} = useCategoriesQuery("");

  if (isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }

  const isNextPage = true;
  const isPrevPage = false;

  
  const addToCartHandler = ( cartItem: CartItem) => {
    if(cartItem?.stock < 1){
      toast.error("Product Out of stock");
    } 

    dispatch(addToCart(cartItem));
    toast.success("Product added into cart")
  }

  return (
    <div className="product-search-page">
      <aside>
        <h2>Filters</h2>
        <div>
          <h4>Sort</h4>
          <select value={sort} onChange={(e) => setSort(e.target.value)} >
            <option value="">None</option>
            <option value="asc">Price (Low to High)</option>
            <option value="dsc">Price (High to Low)</option>
          </select>
        </div>

        <div>
          <h4>Max Price: {maxPrice || ""}</h4>
          <input
            type="range"
            min={100}
            max={100000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>

        <div>
          <h4>Category</h4>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">ALL</option>
            {
              (categoryLoading === false && categoriesResponse) && categoriesResponse?.categories?.map( (category: any) => (
                <option key={category} value={`${category}`}>{category}</option>
              ))
            }
          </select>
        </div>
      </aside>
      <main>
        <h1>Products</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      
        
        {
          productLoading ? <Skeleton length={10} /> :
          <div className="search-product-list">
          {
            searchedData && searchedData?.products?.map((i) => (
             <ProductCard 
                key={i._id}
                photo={i.photo}
                name={i.name}
                price={i.price}
                productId={i._id}
                stock={i.stock}
                handler={addToCartHandler}
            />  
            )
          )}
          </div>
        }

          {searchedData && searchedData.totalPage > 1 && (
          <article>
            <button
              disabled={!isPrevPage}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Prev
            </button>
            <span>
              {page} of {searchedData.totalPage}
            </span>
            <button
              disabled={!isNextPage}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </article>
        )}
        
      </main>
    </div>
  );
};

export default Search;
