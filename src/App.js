import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import LandingPage from "./components/LandingPage";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/main/Dashboard";
import Register from "./components/Register";
import { AuthContextProvider } from "./components/context/AuthContext";
import ProtectedRoutes from "./components/protectedRouting/ProtectedRoutes";
import ProfilePage from "./components/main/ProfilePage";
import PostPage from "./components/main/PostPage.js";
import Explore from "./components/Explore.js";
import FishLibrary from "./components/main/FishLibrary.js";
import About from "./components/main/About.js";
import MarketPage from "./components/main/revisionmain/LandingPageMarket";
import Login from "./components/main/revisionmain/Login.js";
import Create from "./components/main/revisionmain/listing/Create.js";
import Discover from "./components/main/revisionmain/Discover.js";
import Shop from "./components/main/revisionmain/Shop.js";
import AddToCartPage from "./components/main/revisionmain/AddToCartPage.js";
import CartItem from "./components/main/revisionmain/CartItem.js";
import CartListPage from "./components/main/revisionmain/CartListPage.js";
import CartPage from "./components/main/revisionmain/CartPage.js";
function App() {
  return (
    <>
      <AuthContextProvider>
        <ChakraProvider>
          <Routes>
            <Route path="/" element={<MarketPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/createListing" element={<Create />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/AddToCart/:id" element={<AddToCartPage />} />
            <Route path="/CartItem/:id" element={<CartItem />} />
            <Route path="/CartList" element={<CartListPage />} />
            <Route path="/CartPage" element={<CartPage />} />

            {/* <Route path="/AddToCart" element={<AddToCartPage />} /> */}

            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoutes>
                  <Dashboard />
                </ProtectedRoutes>
              }
            />

            {/* <Route
              path="/discover"
              element={
                <ProtectedRoutes>
                  <FishLibrary />
                </ProtectedRoutes>
              }
            /> */}
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoutes>
                  <ProfilePage />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/profile/:userId/post/:postId"
              element={
                <ProtectedRoutes>
                  <PostPage />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoutes>
                  <About />
                </ProtectedRoutes>
              }
            />
          </Routes>
        </ChakraProvider>
      </AuthContextProvider>
    </>
  );
}

export default App;
