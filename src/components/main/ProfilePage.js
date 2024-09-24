import "./ProfilePage.css";
import React, { useEffect, useRef, useState } from "react";
import StarRating from "./revisionmain/StarRating";
import {
  Navigate,
  useNavigate,
  useParams,
  Link,
  useLocation,
} from "react-router-dom";
import Navigation from "./revisionmain/Navigation";
import {
  collection,
  getDocs,
  doc,
  query,
  where,
  updateDoc,
  getDoc,
  onSnapshot,
  setDoc,
  deleteDoc,
  arrayUnion,
  increment
} from "firebase/firestore";
import {
  Box,
  Heading,
  useCardStyles,
  Card,
  Flex,
  Text,
  MenuButton,
  Menu,
  MenuItem,
  MenuList,
  IconButton,
  Image,
  MenuGroup,
  MenuDivider,
  Button,
  useDisclosure,
  Modal,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  useEditableControls,
  Editable,
  Input,
  EditableInput,
  EditablePreview,
  ButtonGroup,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  ModalOverlay,
  InputGroup,
  InputLeftAddon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Center,
  HStack,
  VStack,
  Icon
} from "@chakra-ui/react";
import { db, auth, storage } from "../../firebase/firebaseConfig";
import { UserAuth } from "../context/AuthContext";
import { HamburgerIcon, SmallAddIcon, CheckCircleIcon } from "@chakra-ui/icons";
import {
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  updateProfile,
  getAuth,
  getAdditionalUserInfo,
} from "firebase/auth";
import { formatDistanceToNow } from "date-fns";
import Profile from "./Profile";
import PostOptions from "./mainComponents/PostOptions";
import {
  Home,
  Compass,
  User,
  LogOut,
  Edit,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Edit2,
  Edit3,
  UserCheck,
  UserPlus
} from "react-feather";
import { FaEllipsisH } from "react-icons/fa";
import Comment from "./mainComponents/Comment";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import Footer from "./revisionmain/Footer";
import { AiOutlineShareAlt, AiOutlineMessage, AiOutlineHeart } from 'react-icons/ai';
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import FollowButton from "./revisionmain/FollowButton";
import MessageButton from "./revisionmain/MessageButton";
function EditableControls() {
  const {
    isEditing,
    getSubmitButtonProps,
    getCancelButtonProps,
    getEditButtonProps,
  } = useEditableControls();

  return isEditing ? (
    <ButtonGroup>
      <IconButton icon={<Check />} {...getSubmitButtonProps()} />
      <IconButton icon={<X />} {...getCancelButtonProps()} />
    </ButtonGroup>
  ) : (
    <Flex justifyContent="center">
      <IconButton size="sm" icon={<Edit />} {...getEditButtonProps()} />
    </Flex>
  );
}

function ProfilePage() {
  const { userId } = useParams();
  // const { postId } = useParams();
  const [userRating, setUserRating] = useState(0);
  const { user } = UserAuth();
  const [userData, setUserData] = useState(null);
  const [postData, setPostData] = useState(null);
  // const [newPassword, setNewPassword] = useState();
  const [profileImage, setProfileImage] = useState();
  const [imageUrl, setImageUrl] = useState();
  const navigate = useNavigate();
  const changePass = useDisclosure();
  const clear = useRef();
  const toast = useToast();
  const alert = useDisclosure();
  const profile = useDisclosure();
  const [shopPosts, setShopPosts] = useState([]);
  const [discoverPosts, setDiscoverPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [hasShop, setHasShop] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [reposts, setReposts] = useState([]);
  const profileModal = useDisclosure();
  const [name, setName] = useState(user?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [location, setLocation] = useState(user?.location || "");
  const [newPassword, setNewPassword] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    register: registerUpdate,
    handleSubmit: updateProfile,
    reset: resetUpdate,
    formState: { errors: errorUpdate },
    setValue,
    watch: watchUpdate,
  } = useForm();
  
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  console.log(user);
  const handleSignOut = () => {
    signOut(auth);
    navigate("/");
  };

  let getUrl = window.location.href;

  let splitUrl = getUrl.split("/");

  const handleFollow = async () => {
    if (!userId || !user) return;
  
    try {
      // Fetch the followed user's data
      const followedUserDoc = await getDoc(doc(db, `users1/${userId}`));
      if (!followedUserDoc.exists()) {
        console.error("Followed user does not exist.");
        return;
      }
  
      const followedUserData = followedUserDoc.data();
      const followedUserName = followedUserData.name || user.displayName || "Unknown User";
      const followedUserEmail = followedUserData.email || "No email";
      const followedUserImage = followedUserData.postImage || imageUrl || followedUserData.profileImage || "no img"; // Ensure a default value
  
      // Fetch current user's data (follower)
      const currentUserDoc = await getDoc(doc(db, `users1/${user.uid}`));
      if (!currentUserDoc.exists()) {
        console.error("Current user does not exist.");
        return;
      }
  
      const currentUserData = currentUserDoc.data();
      const currentUserName = currentUserData.name || user.displayName;
      const currentUserEmail = currentUserData.email || user.email;
      const currentUserImage = currentUserData.postImage || imageUrl || currentUserData.profileImage || "no img"; // Ensure a default value
  
      // Add to followers subcollection of the user being followed
      await setDoc(doc(db, `users1/${userId}/followers`, user.uid), {
        followerId: user.uid,
        followedAt: new Date(),
        name: currentUserName,
        email: currentUserEmail,
        postImage: currentUserImage
      });
  
      // Add to following subcollection of the current user
      await setDoc(doc(db, `users1/${user.uid}/following`, userId), {
        followedUserId: userId,
        followedAt: new Date(),
        name: followedUserName,
        email: followedUserEmail,
        postImage: followedUserImage
      });
  
      // Check if both users follow each other, then add to friends subcollection
      const otherUserFollowersDoc = await getDoc(doc(db, `users1/${userId}/following`, user.uid));
      if (otherUserFollowersDoc.exists()) {
        // Add to friends subcollection of both users
        await setDoc(doc(db, `users1/${user.uid}/friends`, userId), {
          friendId: userId,
          addedAt: new Date(),
          name: followedUserName,
          email: followedUserEmail,
          postImage: followedUserImage
        });
  
        await setDoc(doc(db, `users1/${userId}/friends`, user.uid), {
          friendId: user.uid,
          addedAt: new Date(),
          name: currentUserName,
          email: currentUserEmail,
          postImage: currentUserImage
        });
  
        // Update friend count
        const updatedFriendCount = await fetchFriendsCount(user.uid);
        setFriendsCount(updatedFriendCount);
      }
  
      // Update follow count
      const updatedFollowerCount = await fetchFollowerCount(user.uid);
      setFollowersCount(updatedFollowerCount);
  
      setIsFollowing(true);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };
  
  // Function to fetch updated follower count
  const fetchFollowerCount = async (userId) => {
    const followersSnapshot = await getDocs(collection(db, `users1/${userId}/followers`));
    return followersSnapshot.size;
  };
  
  // Function to fetch updated friend count
  const fetchFriendsCount = async (userId) => {
    const friendsSnapshot = await getDocs(collection(db, `users1/${userId}/friends`));
    return friendsSnapshot.size;
  };
  

  // const handleFollow = async () => {
  //   if (!userId || !user) return;
  
  //   try {
  //     // Fetch the followed user's data
  //     const followedUserDoc = await getDoc(doc(db, `users1/${userId}`));
  //     if (!followedUserDoc.exists()) {
  //       console.error("Followed user does not exist.");
  //       return;
  //     }
  
  //     const followedUserData = followedUserDoc.data();
  //     const followedUserName = followedUserData.name || "Unknown User";
  //     const followedUserEmail = followedUserData.email || "No email";
  //     const followedUserImage = followedUserData.postImage || "no img"; // Ensure a default value
  
  //     // Fetch current user's data (follower)
  //     const currentUserDoc = await getDoc(doc(db, `users1/${user.uid}`));
  //     if (!currentUserDoc.exists()) {
  //       console.error("Current user does not exist.");
  //       return;
  //     }
  
  //     const currentUserData = currentUserDoc.data();
  //     const currentUserName = currentUserData.name || user.displayName;
  //     const currentUserEmail = currentUserData.email || user.email;
  //     const currentUserImage = currentUserData.postImage || "no img"; // Ensure a default value
  
  //     // Add to followers subcollection of the user being followed
  //     await setDoc(doc(db, `users1/${userId}/followers`, user.uid), {
  //       followerId: user.uid,
  //       followedAt: new Date(),
  //       name: currentUserName,
  //       email: currentUserEmail,
  //       postImage: currentUserImage
  //     });
  
  //     // Add to following subcollection of the current user
  //     await setDoc(doc(db, `users1/${user.uid}/following`, userId), {
  //       followedUserId: userId,
  //       followedAt: new Date(),
  //       name: followedUserName,
  //       email: followedUserEmail,
  //       postImage: followedUserImage
  //     });
  
  //     // Check if both users follow each other, then add to friends subcollection
  //     const otherUserFollowersDoc = await getDoc(doc(db, `users1/${userId}/following`, user.uid));
  //     if (otherUserFollowersDoc.exists()) {
  //       // Add to friends subcollection of both users
  //       await setDoc(doc(db, `users1/${user.uid}/friends`, userId), {
  //         friendId: userId,
  //         addedAt: new Date(),
  //         name: followedUserName,
  //         email: followedUserEmail,
  //         postImage: followedUserImage
  //       });
  
  //       await setDoc(doc(db, `users1/${userId}/friends`, user.uid), {
  //         friendId: user.uid,
  //         addedAt: new Date(),
  //         name: currentUserName,
  //         email: currentUserEmail,
  //         postImage: currentUserImage
  //       });
  
  //       setFriendsCount((prevCount) => prevCount + 1);
  //     }
  
  //     setIsFollowing(true);
  //     setFollowersCount((prevCount) => prevCount + 1);
  //   } catch (error) {
  //     console.error("Error following user:", error);
  //   }
  // };  
  

  const handleUnfollow = async () => {
    if (!userId || !user) return;

    try {
      await deleteDoc(doc(db, `users1/${userId}/followers`, user.uid));
      await deleteDoc(doc(db, `users1/${user.uid}/following`, userId));

      const friendsSnapshot = await getDocs(collection(db, `users1/${userId}/friends`));
      const friendIds = friendsSnapshot.docs.map(doc => doc.id);
      if (friendIds.includes(user.uid)) {
        await deleteDoc(doc(db, `users1/${user.uid}/friends`, userId));
        await deleteDoc(doc(db, `users1/${userId}/friends`, user.uid));
        setFriendsCount((prevCount) => prevCount - 1);
      }

      setIsFollowing(false);
      setFollowersCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  useEffect(() => {
    if (!userId || !user) return;

    // Check if the current user is following the profile's user
    const checkIfFollowing = async () => {
      const docRef = doc(db, `users1/${user.uid}/following`, userId);
      const docSnap = await getDoc(docRef);
      setIsFollowing(docSnap.exists());
    };

    checkIfFollowing();
  }, [userId, user]);

  const loadData = async () => {
    if (!userId) return;

    const docRef = collection(db, "users1");
    const docSnap = query(docRef, where("userID", "==", userId));
    const userDataVar = await getDocs(docSnap);
    let tempArr = [];
    let testData = userDataVar.forEach((doc) => {
      tempArr.push(doc.data());
    });
    setUserData(...tempArr);
  };

  useEffect(() => {
    const fetchReposts = async () => {
      try {
        const repostsCollection = collection(db, "users1", userId, "reposts");
        const q = query(repostsCollection);
        const querySnapshot = await getDocs(q);
        const repostsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReposts(repostsData);
      } catch (error) {
        console.error("Error fetching reposts: ", error);
      }
    };

    fetchReposts();
  }, [userId]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      // Fetch user data
      const userRef = collection(db, "users1");
      const q = query(userRef, where("userID", "==", userId));
      const userSnap = await getDocs(q);
      const userDoc = userSnap.docs[0]?.data();
      setUserData(userDoc);

      // Fetch followers count
      const followersRef = collection(db, "followers");
      const followersQuery = query(followersRef, where("userId", "==", userId));
      const followersSnap = await getDocs(followersQuery);
      setFollowersCount(followersSnap.size);

      // Fetch following count
      const followingRef = collection(db, "following");
      const followingQuery = query(followingRef, where("userId", "==", userId));
      const followingSnap = await getDocs(followingQuery);
      setFollowingCount(followingSnap.size);

      // Fetch friends count
      const friendsRef = collection(db, "friends");
      const friendsQuery = query(friendsRef, where("userId", "==", userId));
      const friendsSnap = await getDocs(friendsQuery);
      setFriendsCount(friendsSnap.size);
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const cartItemsRef = collection(db, "payments");
        const q = query(cartItemsRef, where("status", "==", "Completed"));
        const querySnapshot = await getDocs(q);
        const fetchedReviews = [];
        let totalRating = 0;
        let numRatings = 0;

        querySnapshot.forEach((doc) => {
          const cartItemData = doc.data();

          // Filter only the cart items that belong to the current user
          const userCartItems = cartItemData.cartItems.filter(
            (item) => item.authorID === user.uid
          );

          // Only calculate ratings for the current user's items
          userCartItems.forEach((item) => {
            fetchedReviews.push({ id: doc.id, ...cartItemData });
            totalRating += item.rating || 0;
            numRatings++;
          });
        });

        if (numRatings > 0) {
          setAvgRating(totalRating / numRatings);
        } else {
          setAvgRating(0);
        }

        console.log("Fetched reviews for current user:", fetchedReviews); // Log fetched reviews for debugging
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews: ", error);
      }
    };

    fetchReviews();
  }, [userId]);

  useEffect(() => {
    loadData();
  }, []);
  const handleChangePassword = async (data) => {
    console.log(data);

    if (user) {
      try {
        await updatePassword(user, data.changePassword).then(() => {
          toast({
            title: "Password Changed.",
            description: "Nice! Password is successfully changed.",
            status: "success",
            duration: 3000,
            position: "top",
          });
        });
      } catch (err) {
        toast({
          title: "Action can't be done.",
          description:
            "Sorry, there seems to be a problem with the action you're trying. Please try loggin in again and repeat the action.",
          status: "error",
          duration: 3000,
          position: "top",
        });
      }
    }
    reset();
  };

  useEffect(() => {
    const fetchUserDiscoverPosts = async () => {
      if (!userId) return;
      const docRef = collection(db, "discover");
      const docSnap = query(docRef, where("authorID", "==", userId));
      const postDataVar = await getDocs(docSnap);
      let tempArr = [];
      postDataVar.forEach((doc) => {
        tempArr.push({ ...doc.data(), id: doc.id });
      });
      setDiscoverPosts(tempArr);
    };
    fetchUserDiscoverPosts();
  }, [userId]);

  useEffect(() => {
    const fetchMarketplace = async () => {
      if (!userId) return;
      const docRef = collection(db, "marketplace");
      const docSnap = query(docRef, where("authorID", "==", userId));
      const postDataVar = await getDocs(docSnap);
      let tempArr = [];
      postDataVar.forEach((doc) => {
        tempArr.push({ ...doc.data(), id: doc.id });
      });
      setShopPosts(tempArr);
    };
    fetchMarketplace();
  }, [userId]);
  // useEffect(() => {
  //   const fetchUserShopPosts = async () => {
  //     if (!userId) return;
  //     const docRef = collection(db, "shop");
  //     const docSnap = query(docRef, where("authorID", "==", userId));
  //     const postDataVar = await getDocs(docSnap);
  //     let tempArr = [];
  //     postDataVar.forEach((doc) => {
  //       tempArr.push({ ...doc.data(), id: doc.id });
  //     });
  //     setShopPosts(tempArr);
  //   };
  //   fetchUserShopPosts();
  // }, [userId]);

  const handleProfileChange = async (e) => {
    setProfileImage(e.target.files[0]);
    const imageRef = ref(
      storage,
      `profileImages/${e.target.files[0].name + "&" + userData.name}`
    );
    try {
      await uploadBytes(imageRef, e.target.files[0]).then((snapshot) => {
        console.log("Uploaded a blob or file!");
        console.log(snapshot);
      });
      getDownloadURL(imageRef).then((url) => {
        console.log(url);
        if (url === null) {
          console.log("error");
        }
        setImageUrl(url);
      });
    } catch (err) {
      console.log(err.message);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and a max length of 10
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  const handleSubmitProfilePicture = async (e) => {
    e.preventDefault();
    const userRef = doc(db, "users1", userData.userID);

    try {
      await updateDoc(userRef, {
        profileImage: imageUrl,
      });
      await updateProfile(user, {
        photoURL: imageUrl,
      });
      toast({
        title: "Profile Updated!",
        description: "Profile picture is successfully updated.",
        status: "success",
        duration: 5000,
        position: "top",
      });
    } catch (err) {
      console.log(err.message);
    }
    window.location.reload();
  };

  const handleSubmitProfile = async () => {
    const userRef = doc(db, "users1", user.uid);

    try {
      // Update profile image
      await updateProfile(user, { photoURL: imageUrl });

      // Update Firestore
      await updateDoc(userRef, {
        profileImage: imageUrl,
        displayName: name,
        phoneNumber,
        location,
      });

      // Update password if provided
      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      toast({
        title: "Profile Updated!",
        description: "Your profile has been updated successfully.",
        status: "success",
        duration: 3000,
        position: "top",
      });
    } catch (err) {
      toast({
        title: "Update Failed!",
        description: "There was an error updating your profile.",
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  const onReportUser = async () => {
    if (!user || !userData?.userID) return;
  
    try {
      const reportsRef = doc(db, "reports", userData.userID);
  
      const docSnap = await getDoc(reportsRef);
      
      if (docSnap.exists()) {
        // If the document exists, update it
        await updateDoc(reportsRef, {
          reportedBy: arrayUnion(user.uid),
          reportCount: increment(1),
        });
      } else {
        // If the document does not exist, create it
        await setDoc(reportsRef, {
          reportedBy: [user.uid],  // Start the array with the current user
          reportCount: 1,          // Initialize report count as 1
        });
      }
  
      toast({
        title: "User Reported",
        description: "Thank you for reporting. We will review this report.",
        status: "success",
        duration: 3000,
        position: "top",
      });
    } catch (error) {
      console.error("Error reporting user: ", error);
      toast({
        title: "Report Failed",
        description: "There was an issue reporting the user. Please try again.",
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  const handleUpdateProfile = async (data) => {
    // setValue("name", data.name);
    // setValue("phone", data.phone);
    // setValue("location", data.location);
    setUpdating(true);
    try {
      const userRef = doc(db, "users1", userId);
      // const docSnap = doc(userRef, where("userID", "==", userId));

      await updateDoc(userRef, {
        name: data.name,
        phone: data.phone,
        location: data.location,
      });
      console.log(data);
      toast({
        title: "Success!",
        description: "Profile successfully updated.",
        status: "success",
        duration: 2000,
        position: "top",
      });
    } catch (err) {
      console.log(err.message);
      toast({
        title: "Oops!",
        description:
          "Failed to update profile. Please contact customer service.",
        status: "error",
        duration: 2000,
        position: "top",
      });
    } finally {
      setUpdating(false);
      window.location.reload();
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    onOpen();
  };

  // const handleFollow = async () => {
  //   if (!userId || !user) return;
  
  //   try {
  //     // Fetch the followed user's data
  //     const followedUserDoc = await getDoc(doc(db, `users1/${userId}`));
  //     if (!followedUserDoc.exists()) {
  //       console.error("Followed user does not exist.");
  //       return;
  //     }
  
  //     const followedUserData = followedUserDoc.data();
  //     const followedUserName = followedUserData.name || "Unknown User";
  //     const followedUserEmail = followedUserData.email || "No email";
  //     const followedUserImage = followedUserData.postImage || "no img"; // Ensure a default value
  
  //     // Fetch current user's data (follower)
  //     const currentUserDoc = await getDoc(doc(db, `users1/${user.uid}`));
  //     if (!currentUserDoc.exists()) {
  //       console.error("Current user does not exist.");
  //       return;
  //     }
  
  //     const currentUserData = currentUserDoc.data();
  //     const currentUserName = currentUserData.name || user.displayName;
  //     const currentUserEmail = currentUserData.email || user.email;
  //     const currentUserImage = currentUserData.postImage || "no img"; // Ensure a default value
  
  //     // Add to followers subcollection of the user being followed
  //     await setDoc(doc(db, `users1/${userId}/followers`, user.uid), {
  //       followerId: user.uid,
  //       followedAt: new Date(),
  //       name: currentUserName,
  //       email: currentUserEmail,
  //       postImage: currentUserImage
  //     });
  
  //     // Add to following subcollection of the current user
  //     await setDoc(doc(db, `users1/${user.uid}/following`, userId), {
  //       followedUserId: userId,
  //       followedAt: new Date(),
  //       name: followedUserName,
  //       email: followedUserEmail,
  //       postImage: followedUserImage
  //     });
  
  //     // Check if both users follow each other, then add to friends subcollection
  //     const otherUserFollowersDoc = await getDoc(doc(db, `users1/${userId}/following`, user.uid));
  //     if (otherUserFollowersDoc.exists()) {
  //       // Add to friends subcollection of both users
  //       await setDoc(doc(db, `users1/${user.uid}/friends`, userId), {
  //         friendId: userId,
  //         addedAt: new Date(),
  //         name: followedUserName,
  //         email: followedUserEmail,
  //         postImage: followedUserImage
  //       });
  
  //       await setDoc(doc(db, `users1/${userId}/friends`, user.uid), {
  //         friendId: user.uid,
  //         addedAt: new Date(),
  //         name: currentUserName,
  //         email: currentUserEmail,
  //         postImage: currentUserImage
  //       });
  
  //       // Update friend count
  //       const updatedFriendCount = await fetchFriendsCount(user.uid);
  //       setFriendsCount(updatedFriendCount);
  //     }
  
  //     // Update follow count
  //     const updatedFollowerCount = await fetchFollowerCount(user.uid);
  //     setFollowersCount(updatedFollowerCount);
  
  //     setIsFollowing(true);
  //   } catch (error) {
  //     console.error("Error following user:", error);
  //   }
  // };
  
  // // Function to fetch updated follower count
  // const fetchFollowerCount = async (userId) => {
  //   const followersSnapshot = await getDocs(collection(db, `users1/${userId}/followers`));
  //   return followersSnapshot.size;
  // };
  
  // // Function to fetch updated friend count
  // const fetchFriendsCount = async (userId) => {
  //   const friendsSnapshot = await getDocs(collection(db, `users1/${userId}/friends`));
  //   return friendsSnapshot.size;
  // };
  

  // // const handleFollow = async () => {
  // //   if (!userId || !user) return;
  
  // //   try {
  // //     // Fetch the followed user's data
  // //     const followedUserDoc = await getDoc(doc(db, `users1/${userId}`));
  // //     if (!followedUserDoc.exists()) {
  // //       console.error("Followed user does not exist.");
  // //       return;
  // //     }
  
  // //     const followedUserData = followedUserDoc.data();
  // //     const followedUserName = followedUserData.name || "Unknown User";
  // //     const followedUserEmail = followedUserData.email || "No email";
  // //     const followedUserImage = followedUserData.postImage || "no img"; // Ensure a default value
  
  // //     // Fetch current user's data (follower)
  // //     const currentUserDoc = await getDoc(doc(db, `users1/${user.uid}`));
  // //     if (!currentUserDoc.exists()) {
  // //       console.error("Current user does not exist.");
  // //       return;
  // //     }
  
  // //     const currentUserData = currentUserDoc.data();
  // //     const currentUserName = currentUserData.name || user.displayName;
  // //     const currentUserEmail = currentUserData.email || user.email;
  // //     const currentUserImage = currentUserData.postImage || "no img"; // Ensure a default value
  
  // //     // Add to followers subcollection of the user being followed
  // //     await setDoc(doc(db, `users1/${userId}/followers`, user.uid), {
  // //       followerId: user.uid,
  // //       followedAt: new Date(),
  // //       name: currentUserName,
  // //       email: currentUserEmail,
  // //       postImage: currentUserImage
  // //     });
  
  // //     // Add to following subcollection of the current user
  // //     await setDoc(doc(db, `users1/${user.uid}/following`, userId), {
  // //       followedUserId: userId,
  // //       followedAt: new Date(),
  // //       name: followedUserName,
  // //       email: followedUserEmail,
  // //       postImage: followedUserImage
  // //     });
  
  // //     // Check if both users follow each other, then add to friends subcollection
  // //     const otherUserFollowersDoc = await getDoc(doc(db, `users1/${userId}/following`, user.uid));
  // //     if (otherUserFollowersDoc.exists()) {
  // //       // Add to friends subcollection of both users
  // //       await setDoc(doc(db, `users1/${user.uid}/friends`, userId), {
  // //         friendId: userId,
  // //         addedAt: new Date(),
  // //         name: followedUserName,
  // //         email: followedUserEmail,
  // //         postImage: followedUserImage
  // //       });
  
  // //       await setDoc(doc(db, `users1/${userId}/friends`, user.uid), {
  // //         friendId: user.uid,
  // //         addedAt: new Date(),
  // //         name: currentUserName,
  // //         email: currentUserEmail,
  // //         postImage: currentUserImage
  // //       });
  
  // //       setFriendsCount((prevCount) => prevCount + 1);
  // //     }
  
  // //     setIsFollowing(true);
  // //     setFollowersCount((prevCount) => prevCount + 1);
  // //   } catch (error) {
  // //     console.error("Error following user:", error);
  // //   }
  // // };  
  

  // const handleUnfollow = async () => {
  //   if (!userId || !user) return;

  //   try {
  //     await deleteDoc(doc(db, `users1/${userId}/followers`, user.uid));
  //     await deleteDoc(doc(db, `users1/${user.uid}/following`, userId));

  //     const friendsSnapshot = await getDocs(collection(db, `users1/${userId}/friends`));
  //     const friendIds = friendsSnapshot.docs.map(doc => doc.id);
  //     if (friendIds.includes(user.uid)) {
  //       await deleteDoc(doc(db, `users1/${user.uid}/friends`, userId));
  //       await deleteDoc(doc(db, `users1/${userId}/friends`, user.uid));
  //       setFriendsCount((prevCount) => prevCount - 1);
  //     }

  //     setIsFollowing(false);
  //     setFollowersCount((prevCount) => prevCount - 1);
  //   } catch (error) {
  //     console.error("Error unfollowing user:", error);
  //   }
  // };


  console.log(postData);
  const handleGetId = () => {};

  const handleCancelUpload = () => {};

  const isOwnProfile = userId === user?.uid;

  return (
    <>
      <Box h="auto">
        <Navigation
          cartItemCount={cartItemCount}
          setCartItemCount={setCartItemCount}
        />

        {userData && userData ? (
          <Box key={userData.id} zIndex="2">
            <Flex
              pt="24px"
              align="center"
              justify="center"
              flexDirection="column"
            >
              <Flex w="100%">
                <Box>
                  <Flex
                    justify="center"
                    align="center"
                    h="150px"
                    w="150px"
                    ml="200px"
                    borderRadius="50%"
                    className="imageFlex"
                    borderWidth="2px"
                    // borderColor="#0d1b2a"
                  >
                    <Box
                      className="imageHoverOption"
                      bg={userData.userID !== user.uid ? "none" : ""}
                      display={userData.userID !== user.uid ? "none" : ""}
                    >
                      <Button
                        color="#fff"
                        variant="none"
                        leftIcon={<Edit2 size={16} color="#fff" />}
                        onClick={profile.onOpen}
                        display={
                          userData.userID !== user.uid ? "none" : "block"
                        }
                      >
                        Edit
                        <Modal
                          size="xs"
                          isOpen={profile.isOpen}
                          onClose={profile.onClose}
                        >
                          <ModalOverlay />
                          <ModalContent>
                            <form>
                              <ModalBody>
                                <Flex
                                  p="32px 24px"
                                  w="100%"
                                  justify="center"
                                  align="center"
                                  flexDirection="column"
                                >
                                  <InputGroup
                                    display="flex"
                                    justifyContent="center"
                                    alignContent="center"
                                  >
                                    <FormLabel
                                      htmlFor="file"
                                      ml="2px"
                                      cursor="pointer"
                                      className="addImageButton"
                                      p="4px 8px"
                                      borderRadius="4px"
                                      display={profileImage ? "none" : "flex"}
                                      alignItems="center"
                                    >
                                      <SmallAddIcon />
                                      Click to Add Photo
                                    </FormLabel>

                                    <Input
                                      type="file"
                                      name="file"
                                      id="file"
                                      accept=".jpg, .jpeg, .png"
                                      multiple
                                      hidden
                                      onChange={handleProfileChange}
                                    />
                                    {profileImage && profileImage ? (
                                      <Flex
                                        w="100%"
                                        justify="center"
                                        align="center"
                                        flexDirection="column"
                                      >
                                        <Text as="b">
                                          Image is ready for upload!
                                        </Text>
                                        <br />
                                        <br />
                                        <Box
                                          h="150px"
                                          w="150px"
                                          borderRadius="50%"
                                          overflow="hidden"
                                        >
                                          <Image w="100%" src={imageUrl} />
                                        </Box>
                                      </Flex>
                                    ) : (
                                      <></>
                                    )}
                                  </InputGroup>
                                  <Flex
                                    mt="32px"
                                    w="100%"
                                    justify="space-around"
                                    align="center"
                                  >
                                    <Button
                                      colorScheme="telegram"
                                      onClick={handleSubmitProfilePicture}
                                    >
                                      Upload
                                    </Button>
                                    <Button
                                      variant="none"
                                      onClick={() => {
                                        profile.onClose();
                                        setImageUrl("");
                                        setProfileImage("");
                                      }}
                                    >
                                      Close
                                    </Button>
                                  </Flex>
                                </Flex>
                              </ModalBody>
                            </form>
                          </ModalContent>
                        </Modal>
                      </Button>
                    </Box>
                    {userData.profileImage ? (
                      <Image
                        h="100%"
                        w="100%"
                        objectFit="cover"
                        className="profilePicture"
                        src={userData.profileImage}
                      />
                    ) : (
                      <Text>User Avatar</Text>
                    )}
                  </Flex>
                  {/* <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    ml="45%"
                    mt="10px"
                    w="250px"
                  
                  >
                    <StarRating rating={avgRating} avgRating={avgRating} />

                    <Text ml="2" fontWeight="bold">
                      {avgRating.toFixed(1)} / 5 ({reviews.length} ratings)
                    </Text>
                  </Box> */}
                </Box>

                <Flex mx="100px" flexDirection="column">
                  <Box>
                    <Heading>{userData.name}</Heading>
                    <Text fontSize="sm">
                      <strong>UID: </strong>
                      {userData.userID}
                    </Text>
                    <Text color="#9c9c9c" fontSize="xs" as="i">
                      Member since {formatDistanceToNow(userData.dateCreated)}{" "}
                      ago
                    </Text>
                  </Box>

                  <br />
                  <Flex>
                  {isOwnProfile ? (
        <>
        <Button colorScheme="teal" onClick={profileModal.onOpen} leftIcon={<Edit3 />}>
          Edit Profile
        </Button>
  
        <Modal
                          isOpen={profileModal.isOpen}
                          onClose={profileModal.onClose}
                        >
                          <ModalOverlay />
                          <ModalContent maxW="lg" mx="auto" mt="5">
                            <ModalHeader
                              borderBottom="2px"
                              borderColor="#e1e5ee"
                            >
                              Edit Profile
                            </ModalHeader>
                            <ModalBody>
                              <form
                                onSubmit={updateProfile(handleUpdateProfile)}
                              >
                                <Box p="6">
                                  {/* <Box mb="4">
                                    <FormLabel>Profile Image</FormLabel>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleProfileChange}
                                    />
                                    {profileImage && (
                                      <Image
                                        mt="2"
                                        borderRadius="full"
                                        boxSize="150px"
                                        src={imageUrl}
                                        alt="Profile Image"
                                      />
                                    )}
                                  </Box> */}
                                  <FormLabel mb="2">Name</FormLabel>
                                  <Input mb="4" {...registerUpdate("name")}
                                  defaultValue={userData.name || "Enter your name"}
                                  />
                                  <FormLabel mb="2">Phone Number</FormLabel>
                                  <Input
                                    type="tel"
                                    mb="4"
                                    {...registerUpdate("phone")}
                                    defaultValue={userData.phone || "Enter your phone number"}
                                  />
                                  <FormLabel mb="2">Location</FormLabel>
                                  <Input
                                    mb="4"
                                    {...registerUpdate("location")}
                                    defaultValue={userData.location || "Enter your location"}
                                  />
                                  {/* <FormLabel mb="2">New Password</FormLabel>
                                  <Input
                                    type="password"
                                    placeholder="Enter a new password"
                                  /> */}
                                </Box>
                                <Flex
                                  justifyContent="flex-end"
                                  gap={2}
                                  p="4px 0"
                                >
                                  <Button
                                    colorScheme="blue"
                                    minWidth="100px"
                                    type="submit"
                                    isLoading={updating}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={profileModal.onClose}
                                    minWidth="100px"
                                  >
                                    Cancel
                                  </Button>
                                </Flex>
                              </form>
                            </ModalBody>
                          </ModalContent>
                        </Modal>
      </>
      ) : (
        <Button
          onClick={isFollowing ? handleUnfollow : handleFollow}
          leftIcon={isFollowing ? <UserCheck /> : <UserPlus />}
          colorScheme={isFollowing ? "teal" : "blue"}
          mb={4}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
                    {/* <FollowButton userId={userId} currentUserId={user?.uid} /> */}
                    <MessageButton userId={userData?.userID} />
                  </Flex>
                  <Flex position="relative" right="70%">
                  <FollowButton userId={userId} currentUserId={user?.uid} followCount={followCount}/>
                  </Flex>
                </Flex>

                {/* Conditionally render the Report User option */}
                {user && user.uid !== userData.userID && (
                   <Menu>
                   <MenuButton as={IconButton} icon={<FaEllipsisH />} />
                   <MenuList>
                   <MenuItem onClick={onReportUser} color="red.500">Report User</MenuItem>
                   </MenuList>
                   </Menu>
                 )} 
                <Box display={userData.userID !== user.uid ? "none" : ""}>
                  {/* <Button
                    onClick={() => {
                      editProfile.onOpen();
                    }}
                    variant="outline"
                  >
                    <Settings />
                  </Button> */}
                  <Menu>
                    {({ isOpen }) => (
                      <>
                        <MenuButton
                          isActive={isOpen}
                          as={IconButton}
                          variant="outline"
                          icon={isOpen ? <ChevronUp /> : <ChevronDown />}
                          bg="#fff"
                        ></MenuButton>
                        <MenuList>
                          {/* <MenuItem>Edit</MenuItem> */}
                          <MenuItem onClick={changePass.onOpen}>
                            Change Password
                          </MenuItem>
                          <Modal
                            className="modalPassword"
                            isOpen={changePass.isOpen}
                            isClose={changePass.isClose}
                          >
                            <ModalOverlay />
                            <ModalContent>
                              <ModalHeader>Change Password</ModalHeader>
                              <form
                                onSubmit={handleSubmit(handleChangePassword)}
                              >
                                <ModalBody>
                                  <Input
                                    mt="12px"
                                    type="password"
                                    placeholder="Enter new password"
                                    {...register("changePassword", {
                                      required: true,
                                      minLength: {
                                        value: 6,
                                        message:
                                          "Password must be at least 6 characters.",
                                      },
                                    })}
                                    aria-invalid={
                                      errors.changePassword ? "true" : "false"
                                    }
                                    id="changePassword"

                                    // onChange={(e) => {
                                    //   setNewPassword(e.target.value);
                                    // }}
                                    // ref={clear}
                                  />
                                  {errors.changePassword?.type ===
                                    "required" && (
                                    <p
                                      style={{
                                        color: "#d9534f",
                                        fontSize: "12px",
                                      }}
                                    >
                                      Confirm Password is required
                                    </p>
                                  )}
                                  <Input
                                    mt="12px"
                                    type="password"
                                    placeholder="Confirm new password"
                                    {...register("confirmPassword", {
                                      required: true,
                                      minLength: {
                                        value: 6,
                                        message:
                                          "Password must be at least 6 characters.",
                                      },
                                      validate: (val) => {
                                        if (watch("changePassword") !== val) {
                                          return "Password do not match!";
                                        }
                                      },
                                    })}
                                    aria-invalid={
                                      errors.confirmPassword ? "true" : "false"
                                    }
                                    id="confirmPassword"

                                    // onChange={(e) => {
                                    //   setNewPassword(e.target.value);
                                    // }}
                                    // ref={clear}
                                  />
                                  {errors.confirmPassword?.type ===
                                    "required" && (
                                    <p
                                      style={{
                                        color: "#d9534f",
                                        fontSize: "12px",
                                      }}
                                    >
                                      Confirm Password is required
                                    </p>
                                  )}
                                  {errors?.confirmPassword && (
                                    <p
                                      style={{
                                        color: "#d9534f",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {errors.confirmPassword.message}
                                    </p>
                                  )}

                                  <Flex justify="end" align="center" w="100%">
                                    <Button
                                      type="submit"
                                      colorScheme="telegram"
                                      mt="12px"
                                    >
                                      Change
                                    </Button>
                                    <Button
                                      onClick={changePass.onClose}
                                      mt="12px"
                                    >
                                      Cancel
                                    </Button>
                                  </Flex>
                                </ModalBody>
                              </form>
                            </ModalContent>
                          </Modal>
                        </MenuList>
                      </>
                    )}
                  </Menu>
                </Box>
              </Flex>

              <Flex
                w="100%"
                justify="center"
                align="center"
                flexDirection="column"
                boxShadow="0px -4px 5px #e1e1e1"
                mt="32px"
                mb="6"
                pt="24px"
                // borderWidth="2px" borderColor="blue"
              >
                <>
                  <Tabs
                    // borderWidth="2px" borderColor="red"
                    size="md"
                    variant="enclosed"
                    w="100%"
                    justify="center"
                    align="center"
                  >
                    <TabList mb="1em">
                      <Tab w="8%">Posts</Tab>
                      <Tab w="8%">Reposts</Tab>
                      <Tab w="8%">Marketplace</Tab>
                      <Tab w="8%">About</Tab>
                    </TabList>
                    <TabPanels>
                    <TabPanel>
                        <Flex
                          flexDirection="column"
                          w="100%"
                          align="center"
                          justify="center"
                          maxW="1500px"
                          // border="1px solid #e1e1e1"
                          // borderRadius="md"
                          mb="4"
                          overflow="hidden"
                          // boxShadow="md"
                        >
                          {discoverPosts.length === 0 ? (
                            <Flex
                              justify="center"
                              align="center"
                              p="10"
                              mb="20"
                            >
                              <Text color="#7f7f7f">
                                It feels so lonely here...
                              </Text>
                            </Flex>
                          ) : (
                            discoverPosts.map((post) => (
                              <Card
                                key={post.id}                       
                                w="100%" // Ensures card takes full width within the container
                                maxW="600px" // Sets a max width similar to Facebook posts
                                p="6px"
                                my="16px"
                                border="1px solid #e1e1e1"
                                borderRadius="lg"
                                boxShadow="lg"
                                //  borderWidth="2px"
                                // borderColor="red"
                              >

                              <Flex align="center" >
                               <Image
                               src={userData.profileImage}
                               borderRadius="full"
                               boxSize="50px"
                               mr="2"
                              />
                              <VStack align="start" spacing="1">                                         
                              <Text fontWeight="bold">{post.authorName}</Text>
                              <Text fontSize="sm" color="gray.500">
                              {formatDistanceToNow(post.createdAt)} ago
                              </Text>
                              </VStack>
                              </Flex>
        
                                <Flex flexDirection="column">
                                  <Box>
                                    <Profile
                                      name={post.name}
                                      authorId={post.authorId}
                                    />
                                  </Box>
                                  <PostOptions
                                  postId={post.id}
                                  authorId={post.authorId}
                                  />
                                  <Text
                                    as="kbd"
                                    fontSize="10px"
                                    color="gray.500"
                                  >
                                  </Text>
                        
                                  <Flex
                                    pl="4px"
                                    py="10px"
                                    mt="-10"
                                    justify="space-between"
                                  >
                                    <Box>
                                      <Link to={"/AddToCart/" + post.id}>
                                        <Heading size="md">
                                          {/* {post.postTitle} */}
                                        </Heading>
                                      </Link>
                                      <br />

                                      <Text
                                        className="truncate"
                                        fontSize="16px"
                                        textAlign="justify"
                                      >
                                        {post.postContent}
                                      </Text>
                                    </Box>

                                    {/* <Box mr="24px">
                                    {!post.price ? (
                                      <Text>₱ 0.00</Text>
                                    ) : (
                                      <>
                                        <strong>₱ </strong>
                                        {post.price}
                                      </>
                                    )}
                                  </Box> */}
                                  </Flex>
                                  <Flex
                                    w="100%"
                                    align="center"
                                    justify="center"
                                    mb="2"
                                  >
                                    {post.postImage && (
                                      <Image
                                        src={post.postImage}
                                        w="100%"
                                        maxH="500px" // Limits height to keep post size consistent
                                        objectFit="cover"                                        
                                        borderRadius="lg"
                                        alt="post image"
                                        _hover={{ transform: 'scale(1.02)', boxShadow: 'lg' }}
                                        transition="all 0.3s ease"
                                        onClick={() => handlePostClick(post)} // Open modal only when image is clicked
                                        onError={(e) =>
                                          (e.target.style.display = "none")
                                        }
                                      />
                                    )}
                                    {post.postVideo && (
                                      <video
                                        muted={true}
                                        controls
                                        style={{
                                          width: "100%",
                                          height: "500px",
                                          objectFit: "cover",
                                        }}
                                        onMouseEnter={(e) => e.target.play()}
                                        onMouseLeave={(e) => e.target.pause()}
                                        onClick={() => handlePostClick(post)} // Open modal only when video is clicked
                                      >
                                        <source
                                          src={post.postVideo}
                                          type="video/mp4"
                                        />
                                        Your browser does not support the video
                                        tag.
                                      </video>
                                    )}
                                  </Flex>
                                  {/* <Box w="100%">
                                    <Comment
                                      postID={post.id}
                                      authorId={post.authorId}
                                    />
                                  </Box> */}
                                    {/* Interactions */}
                                   </Flex>
                                   <Flex justify="Left" align="center" mt="-1" p="3">
                                   <HStack spacing="10">
          
                                   {/* Comment button with text */}
                                   <Flex align="center">
                                   <IconButton
                                   aria-label="Like post"
                                   icon={<Icon as={AiOutlineMessage} boxSize={6} />}
                                   variant="ghost"    
                                   onClick={() => handlePostClick(post)}
                                   />
                                  </Flex>

                                  </HStack>
                                </Flex>
                              </Card>
                            ))
                          )}
                        </Flex>
                      </TabPanel>

                      <TabPanel>
                        {/* New Panel for Reposts */}
                        <Flex
                          flexDirection="column"
                          w="100%"
                          align="center"
                          justify="center"
                        >
                          {reposts.length === 0 ? (
                            <Flex
                              justify="center"
                              align="center"
                              p="10"
                              mb="20"
                            >
                              <Text color="#7f7f7f">No reposts to show...</Text>
                            </Flex>
                          ) : (
                            reposts.map((post) => (
                              <Card
                                key={post.id}
                                w="50%"
                                p="24px 24px"
                                my="16px"
                                border="1px solid #e1e1e1"
                              >
                                <Flex flexDirection="column">
                                  <Box>
                                    <Profile
                                      name={post.name}
                                      authorId={post.authorId}
                                    />
                                  </Box>
                                  <PostOptions
                                    postId={post.id}
                                    authorId={post.authorId}
                                  />
                                  <Text
                                    as="kbd"
                                    fontSize="10px"
                                    color="gray.500"
                                  >
                                    {formatDistanceToNow(post.createdAt)} ago
                                  </Text>
                                  <Button variant="link" color="#333333">
                                    {post.authorName}
                                  </Button>
                                  <Flex
                                    pl="32px"
                                    py="32px"
                                    justify="space-between"
                                  >
                                    <Box>
                                      <Link to={`/AddToCart/${post.id}`}>
                                        <Heading size="md">
                                          {post.postTitle}
                                        </Heading>
                                      </Link>
                                      <br />
                                      <Text
                                        className="truncate"
                                        fontSize="16px"
                                        textAlign="justify"
                                      >
                                        {post.postContent}
                                      </Text>
                                    </Box>
                        
                                  </Flex>
                                  <Flex
                                    w="100%"
                                    align="center"
                                    justify="center"
                                  >
                                    {post.postImage && (
                                      <Image
                                        src={post.postImage}
                                        w="40em"
                                        alt="post image"
                                        onError={(e) =>
                                          (e.target.style.display = "none")
                                        }
                                      />
                                    )}
                                    {post.postVideo && (
                                      <video
                                        muted={true}
                                        controls
                                        style={{
                                          width: "100%",
                                          height: "350px",
                                          objectFit: "cover",
                                        }}
                                        onMouseEnter={(e) => e.target.play()}
                                        onMouseLeave={(e) => e.target.pause()}
                                      >
                                        <source
                                          src={post.postVideo}
                                          type="video/mp4"
                                        />
                                        Your browser does not support the video
                                        tag.
                                      </video>
                                    )}
                                  </Flex>
                                  <Box w="100%">
                                    <Comment
                                      postID={post.id}
                                      authorId={post.authorId}
                                    />
                                  </Box>
                                </Flex>
                              </Card>
                            ))
                          )}
                        </Flex>
                      </TabPanel>

                      <TabPanel>
                        {/* <Flex

                            flexDirection="column"
                            w="100%"
                            align="center"
                            justify="center"
                          > */}

                        {/* <Flex
                            flexDirection="row"
                            flexWrap="wrap"
                            justify="center"
                          > */}

                        <Grid
                          className="gridItem__holder"
                          templateColumns={`repeat(5, 1fr)`}
                          gap="2"
                          autoRows="minmax(200px, auto)"
                          rowGap={4}
                        >
                          {shopPosts.length === 0 ? (
                            <Center>
                              <Flex
                                justify="center"
                                align="center"
                                p="10"
                                mb="20"
                              >
                                <Text color="#7f7f7f">
                                  It feels so lonely here...
                                </Text>
                              </Flex>
                            </Center>
                          ) : (
                            shopPosts.map((post) => (
                              // <Card
                              //   key={post.id}
                              //   w={{ base: "100%", md: "45%", lg: "30%" }}
                              //   m="8px"
                              //   // p="24px 24px"
                              //   // my="16px"
                              //   border="1px solid #e1e1e1"
                              // >
                              // <PostOptions
                              //       postId={post.id}
                              //       authorId={post.authorId}
                              //     />
                              <Flex ml="50px">
                              <Flex position="relative" left="100%" top="85%" zIndex="1000">
                                <PostOptions
                                    postId={post.id}
                                    authorId={post.authorID}
                                  />
                              </Flex>
                              <GridItem
                            className="item__wrapper"
                            overflow="hidden"
                            border="1px solid #E9EFEC"
                            borderRadius="12px"
                            key={post.id}
                            colSpan={1}
                            rowSpan={1}
                            onClick={() => {
                              user
                                ? window.open(
                                    `/marketplace/item/${post.id}`,
                                    "_blank",
                                    "noopener,noreferrer"
                                  )
                                : toast({
                                    title: "Oops!",
                                    description: "Please login first.",
                                    status: "error",
                                    duration: 1500,
                                    position: "top",
                                  });
                            }}
                            maxW="250px"
                            cursor="pointer"
                          >
                            <Flex justify="center" align="center">
                              {post.postImage && (
                                <Box overflow="hidden">
                                  <Image
                                    className="item__image"
                                    objectFit="cover"
                                    // maxWidth="300px"
                                    w="300px"
                                    h="300px"
                                    src={post.postImage}
                                    alt="Post Image"
                                  />
                                </Box>
                              )}

                              {post.postVideo && (
                                <video
                                  controls
                                  onLoadedMetadata={(e) => {
                                    e.target.volume = 0.75;
                                  }}
                                  style={{
                                    borderRadius: "8px",
                                    // maxWidth:"500px",
                                    width: "300px",
                                    height: "370px",
                                    objectFit: "cover",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (e.target.paused) {
                                      e.target.play();
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.pause();
                                  }}
                                  // onMouseEnter={(e) => e.target.play()}
                                  // onMouseLeave={(e) => e.target.pause()}
                                >
                                  <source
                                    src={post.postVideo}
                                    type="video/mp4"
                                  />
                                  Your browser does not support the video tag.
                                </video>
                              )}
                            </Flex>
                            <Flex p="8px 16px 0 " justify="space-between">
                              <Text
                                fontWeight="600"
                                color="#333333"
                                fontSize="lg"
                              >
                                {post.postTitle}
                              </Text>
                              <Text fontSize="xs" color="#6e6e6e" as="i">
                                {formatDistanceToNow(new Date(post.createdAt))}
                                ago
                              </Text>
                            </Flex>
                            <Box p="0 16px 0" className="postContent">
                              <Text
                                className="truncate"
                                textAlign="justify"
                                fontSize="xs"
                                mr="3"
                                color="#6e6e6e"
                              >
                                {post.postContent}
                              </Text>
                            </Box>
                            <Flex p="0 16px 12px" justify="space-between">
                              <Text
                                fontSize="md"
                                fontWeight="600"
                                color="#333333"
                              >
                                &#8369;{post.price}
                              </Text>
                            </Flex>
                          </GridItem>
                          </Flex>
                            ))
                          )}

                          {/* </Flex> */}
                        </Grid>
                      </TabPanel>

                      <TabPanel>
                        <Flex
                          flexDirection="column"
                          w="100%"
                          align="center"
                          justify="center"
                        >
                          {userData && (
                            <Card
                              w="50%"
                              p="24px 24px"
                              my="16px"
                              border="1px solid #e1e1e1"
                            >
                              <Flex flexDirection="column">
                                <Box>
                                  <Heading as="h2" size="lg">
                                    About {userData.name}
                                  </Heading>
                                  <Text color="#9c9c9c" fontSize="sm" as="i">
                                    Member since{" "}
                                    {formatDistanceToNow(userData.dateCreated)}{" "}
                                    ago
                                  </Text>
                                  <Text fontSize="lg">
                                    <strong>Location: </strong>
                                    {userData.location}
                                  </Text>
                                  <Text fontSize="lg">
                                    <strong>Email: </strong>
                                    {userData.email}
                                  </Text>
                                  <Text fontSize="lg">
                                    <strong>Phone Number: </strong>
                                    {userData.phone}
                                  </Text>
                                </Box>
                              </Flex>
                            </Card>
                          )}
                        </Flex>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </>
              </Flex>
            </Flex>
          </Box>
        ) : (
          <Flex w="100%" h="100vh" align="center" justify="center">
            <span className="loader"></span>
          </Flex>
        )}
      </Box>
      <Footer />
    </>
  );
}

export default ProfilePage;
