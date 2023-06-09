import React, { useState, useEffect } from "react";
import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";
import { FiHeart } from "react-icons/fi";

import { client, urlFor } from "../../lib/client";
import { Product } from "../../components";
import { useStateContext } from "../../context/StateContext";

import firebaseConfig from "../../lib/firebase";
import { initializeApp } from "firebase/app";
const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

const ProductDetails = ({ product, products }) => {
  const { image, name, details, price, original, mattressOptions, height } =
    product;
  const [index, setIndex] = useState(0);
  const { decQty, incQty, qty, onAdd, setShowCart } = useStateContext();
  const [selectedSize, setSelectedSize] = useState("");
  const [wishlistStatus, setWishlistStatus] = useState(false);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  useEffect(() => {
    // Fire 'view_item' event on page load
    const itemData = {
      item_name: product.name,
      item_slug: product.slug.current,
      item_price: product.price,
      // Add any other relevant item attributes
    };
    window.dataLayer.push({
      event: "view_item",
      ecommerce: {
        items: [itemData],
      },
    });
  }, [product]);

  const checkLoggedInUser = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedInUser(true);
      } else {
        setIsLoggedInUser(false);
      }
    });
  };

  const handleAddToCart = () => {
    // Fire 'add_to_cart' event when item is added to the cart
    let login;
    checkLoggedInUser();
    if (isLoggedInUser) {
      login = "loggedIn";
    } else {
      login = "notLoggedIn";
    }
    const itemData = {
      item_name: product.name,
      item_slug: product.slug.current,
      item_price: product.price,
      // Add any other relevant item attributes
    };
    window.dataLayer.push({
      event: "add_to_cart",
      user_logged_in: login,
      ecommerce: {
        currency: "INR", // Replace with your currency code
        value: price * qty, // Replace with the total value of the added item(s)
        items: [itemData],
      },
    });
  };

  const handleAddToWishlist = () => {
    const wishlistItem = {
      name: product.name,
      slug: product.slug.current,
      price: product.price,
      image: product.image,
    };

    window.dataLayer.push({
      event: "add_to_wishlist",
      ecommerce: {
        items: [wishlistItem],
      },
    });

    // Get the existing wishlist items from localStorage
    const existingWishlist = localStorage.getItem("wishlist");

    // Parse the existing wishlist items or initialize an empty array
    const wishlist = existingWishlist ? JSON.parse(existingWishlist) : [];

    // Check if the item already exists in the wishlist
    const isItemInWishlist = wishlist.some(
      (item) => item.slug === wishlistItem.slug
    );

    if (isItemInWishlist) {
      // Item already exists in the wishlist, handle accordingly (e.g., show a message)
      console.log("Item already exists in the wishlist");
      return;
    }

    // Add the new item to the wishlist array
    wishlist.push(wishlistItem);

    // Log the data that goes into the wishlist
    console.log("Item added to wishlist:", wishlistItem);

    // Store the updated wishlist in localStorage
    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    // Update the wishlist status in the component's state
    setWishlistStatus(true);
  };

  function handleSizeSelection(size) {
    setSelectedSize(size);
  }

  const handleBuyNow = () => {
    onAdd(product, qty);

    handleAddToCart();

    setShowCart(true);

  };

  function calcDiscount(original, price) {
    var discount = original - price;
    var total = (discount / original) * 100;
    return Math.ceil(total);
  }

  return (
    <div>
      <div className="product-detail-container">
        <div>
          <div className="image-container">
            <img
              src={urlFor(image && image[index])}
              className="product-detail-image"
            />
          </div>
          <div className="small-images-holder">
            <div className="small-images-container">
              {image?.map((item, i) => (
                <img
                  key={i}
                  src={urlFor(item)}
                  className={
                    i === index ? "small-image selected-image" : "small-image"
                  }
                  onMouseEnter={() => setIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="product-detail-desc">
          <h1>{name}</h1>
          {/* <div className="reviews">
            <div>
              <AiFillStar />
              <AiFillStar />
              <AiFillStar />
              <AiFillStar />
              <AiOutlineStar />
            </div>
            <p>(20)</p>
          </div> */}
          <h4>Details: </h4>
          <p>{details}</p>
          <div className="price-discount-holder">
            <p className="product-price slugger" style={{ color: "#5430b3" }}>
              ₹{price}
            </p>
            <p className="product-origprice slugger">₹{original}</p>
            <p className="product-discount slugger">
              {calcDiscount(original, price)}% Off
            </p>
          </div>
          <div className="quantity">
            <h3>Quantity:</h3>
            <p className="quantity-desc">
              <span className="minus" onClick={decQty}>
                <AiOutlineMinus />
              </span>
              <span className="num">{qty}</span>
              <span className="plus" onClick={incQty}>
                <AiOutlinePlus />
              </span>
            </p>
          </div>
          <div className="buttons">
            <button
              type="button"
              className="add-to-cart"
              onClick={() => {
                onAdd(product, qty);
                handleAddToCart();
              }}
            >
              Add to Cart
            </button>
            <button type="button" className="buy-now" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
          <div className="buttons">
            {wishlistStatus ? (
              <button
                type="button"
                className="buy-now"
                style={{ backgroundColor: "red", color: "white" }}
              >
                Added to Wishlist <FiHeart />
              </button>
            ) : (
              <button
                type="button"
                className="buy-now"
                style={{
                  backgroundColor: "transparent",
                  color: "red",
                  border: "1px solid red",
                }}
                onClick={handleAddToWishlist}
              >
                Add to Wishlist <FiHeart />
              </button>
            )}
          </div>
          <br />
          {mattressOptions && (
            <div className="variantHolder">
              <h2>Choose a Size</h2>
              <br />
              <div className="sizeButtons">
                {mattressOptions.map((option) => (
                  <button
                    style={{
                      marginRight: "10px",
                      padding: "5px 10px",
                      borderRadius: "50px",
                      border: "none",
                      backgroundColor: "black",
                      color: "white",
                      cursor: "pointer",
                    }}
                    key={option._key}
                    onClick={() => handleSizeSelection(option.mattressSize)}
                    className={
                      option.mattressSize === selectedSize ? "selectedSize" : ""
                    }
                  >
                    {option.mattressSize}
                  </button>
                ))}
              </div>
              <br />
              <h3>{selectedSize}</h3>
              <br />
              {selectedSize && (
                <div
                  className="sizeDetails"
                  style={{ display: "flex", flexWrap: "wrap" }}
                >
                  {mattressOptions.map((option) =>
                    option.mattressSize === selectedSize
                      ? option.dependentMattressDimensions.map(
                          (dimension, index) => (
                            <div key={index} className="productDimensionCard">
                              <p>
                                {dimension.length} x {dimension.width} inches
                              </p>
                            </div>
                          )
                        )
                      : null
                  )}
                </div>
              )}
              <br />
              <h3>Height</h3>
              <br />
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  textAlign: "center",
                }}
              >
                {height.map((option) => (
                  <div
                    key={option._key}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      padding: "10px",
                      marginRight: "10px",
                      width: "10rem",
                      marginBottom: "10px",
                      cursor: "pointer",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <p>{option.height} inches</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="maylike-products-wrapper">
        <h2>You may also like</h2>
        <div className="marquee">
          <div className="maylike-products-container track">
            {products.map((item) => {
              if (item.category === "accessories") {
                return <Product key={item._id} product={item} />;
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getStaticPaths = async () => {
  const query = `*[_type == "product"] {
    slug {
      current
    }
  }
  `;

  const products = await client.fetch(query);

  const paths = products.map((product) => ({
    params: {
      slug: product.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps = async ({ params: { slug } }) => {
  const query = `*[_type == "product" && slug.current == '${slug}'][0]`;
  const productsQuery = '*[_type == "product"]';

  const product = await client.fetch(query);
  const products = await client.fetch(productsQuery);

  // console.log(product._id);

  return {
    props: { products, product },
  };
};

export default ProductDetails;
