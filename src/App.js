import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import LandingPage from "./components/LandingPage";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/main/Dashboard";
import Register from "./components/Register";
import { AuthContextProvider } from "./components/context/AuthContext";
import ProtectedRoutes from "./components/protectedRouting/ProtectedRoutes";
// import ProfilePage from "./components/main/ProfilePage";
import ProfilePage from "./components/main/ProfilePage.js";
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
import ItemStatusPage from "./components/main/revisionmain/ItemStatusPage.js";
import CheckoutDetailsPage from "./components/main/revisionmain/CheckoutDetailsPage.js";
import PaymentPage from "./components/main/revisionmain/PaymentPage.js";
import FilteredItemsPage from "./components/main/revisionmain/FilteredItemsPage.js";
import ReportPage from "./components/main/revisionmain/ReportPage.js";
import Faqs from "./components/main/revisionmain/Faqs.js";
import ReturnsExchanges from "./components/main/revisionmain/ReturnsExchanges.js";
import PrivacyPolicy from "./components/main/revisionmain/PrivacyPolicy.js";
import TermsOfService from "./components/main/revisionmain/TermsOfService.js"; 

import ContactUs from "./components/main/revisionmain/ContactUs.js"; 


function App() {
  return (
    <>
      <AuthContextProvider>
        <ChakraProvider>
          <Routes>
            <Route path="/" element={<MarketPage />} />
            <Route path="/category/:categoryName" element={<FilteredItemsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/createListing" element={<Create />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/AddToCart/:id" element={<AddToCartPage />} />
            <Route path="/CartItem/:id" element={<CartItem />} />
            <Route path="/CartList" element={<CartListPage />} />
            <Route path="/CartPage" element={<CartPage />} />
            <Route path="/ItemStatusPage" element={<ItemStatusPage />} />
            <Route path="/checkout" element={<CheckoutDetailsPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/reports" element={<ReportPage />} />
            <Route path="/faqs" element={<Faqs />} /> 
            <Route path="/return&exchange" element={<ReturnsExchanges />} />
            <Route path="/Privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/contact-us" element={<ContactUs />} />


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
