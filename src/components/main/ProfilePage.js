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
  UserPlus,
} from "react-feather";
import Comment from "./mainComponents/Comment";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import Footer from "./revisionmain/Footer";
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
      const followedUserName = followedUserData.name || "Unknown User";
      const followedUserEmail = followedUserData.email || "No email";
      const followedUserImage =
        followedUserData.postImage ||
        imageUrl ||
        followedUserData.profileImage ||
        "no img"; // Ensure a default value

      // Fetch current user's data (follower)
      const currentUserDoc = await getDoc(doc(db, `users1/${user.uid}`));
      if (!currentUserDoc.exists()) {
        console.error("Current user does not exist.");
        return;
      }

      const currentUserData = currentUserDoc.data();
      const currentUserName = currentUserData.name || user.displayName;
      const currentUserEmail = currentUserData.email || user.email;
      const currentUserImage =
        currentUserData.postImage ||
        imageUrl ||
        currentUserData.profileImage ||
        "no img"; // Ensure a default value

      // Add to followers subcollection of the user being followed
      await setDoc(doc(db, `users1/${userId}/followers`, user.uid), {
        followerId: user.uid,
        followedAt: new Date(),
        name: currentUserName,
        email: currentUserEmail,
        postImage: currentUserImage,
      });

      // Add to following subcollection of the current user
      await setDoc(doc(db, `users1/${user.uid}/following`, userId), {
        followedUserId: userId,
        followedAt: new Date(),
        name: followedUserName,
        email: followedUserEmail,
        postImage: followedUserImage,
      });

      // Check if both users follow each other, then add to friends subcollection
      const otherUserFollowersDoc = await getDoc(
        doc(db, `users1/${userId}/following`, user.uid)
      );
      if (otherUserFollowersDoc.exists()) {
        // Add to friends subcollection of both users
        await setDoc(doc(db, `users1/${user.uid}/friends`, userId), {
          friendId: userId,
          addedAt: new Date(),
          name: followedUserName,
          email: followedUserEmail,
          postImage: followedUserImage,
        });

        await setDoc(doc(db, `users1/${userId}/friends`, user.uid), {
          friendId: user.uid,
          addedAt: new Date(),
          name: currentUserName,
          email: currentUserEmail,
          postImage: currentUserImage,
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
    const followersSnapshot = await getDocs(
      collection(db, `users1/${userId}/followers`)
    );
    return followersSnapshot.size;
  };

  // Function to fetch updated friend count
  const fetchFriendsCount = async (userId) => {
    const friendsSnapshot = await getDocs(
      collection(db, `users1/${userId}/friends`)
    );
    return friendsSnapshot.size;
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
      // console.log(data);
      toast({
        title: "Success!",
        description: "Profile successfully updated.",
        status: "success",
        duration: 2000,
        position: "top",
      });
    } catch (err) {
      // console.log(err.message);
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

      const friendsSnapshot = await getDocs(
        collection(db, `users1/${userId}/friends`)
      );
      const friendIds = friendsSnapshot.docs.map((doc) => doc.id);
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
            (item) => item.authorID === user?.uid
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
    const fetchUserShopPosts = async () => {
      if (!userId) return;
      const docRef = collection(db, "shop");
      const docSnap = query(docRef, where("authorID", "==", userId));
      const postDataVar = await getDocs(docSnap);
      let tempArr = [];
      postDataVar.forEach((doc) => {
        tempArr.push({ ...doc.data(), id: doc.id });
      });
      setShopPosts(tempArr);
    };
    fetchUserShopPosts();
  }, [userId]);

  const handleProfileChange = async (e) => {
    setProfileImage(e.target.files[0]);
    const imageRef = ref(
      storage,
      `profileImages/${e.target.files[0].name + "&" + userData.name}`
    );
    try {
      await uploadBytes(imageRef, e.target.files[0]).then((snapshot) => {
        // console.log("Uploaded a blob or file!");
        // console.log(snapshot);
      });
      getDownloadURL(imageRef).then((url) => {
        // console.log(url);
        if (url === null) {
          // console.log("error");
        }
        setImageUrl(url);
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        status: "error",
        duration: 1500,
        position: "top",
      });
      // console.log(err.message);
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
      toast({
        title: "Error",
        description: "Failed to upload image",
        status: "error",
        duration: 1500,
        position: "top",
      });
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
                        <Button
                          colorScheme="teal"
                          onClick={profileModal.onOpen}
                          leftIcon={<Edit3 />}
                        >
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
                                  <Input mb="4" {...registerUpdate("name")} />
                                  <FormLabel mb="2">Phone Number</FormLabel>
                                  <Input
                                    type="tel"
                                    mb="4"
                                    {...registerUpdate("phone")}
                                  />
                                  <FormLabel mb="2">Location</FormLabel>
                                  <Input
                                    mb="4"
                                    {...registerUpdate("location")}
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
                    <FollowButton
                      userId={userId}
                      currentUserId={user?.uid}
                      followCount={followCount}
                    />
                  </Flex>
                </Flex>
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
                      <Tab w="8%">Shop</Tab>
                      <Tab w="8%">About</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <Flex
                          flexDirection="column"
                          w="100%"
                          align="center"
                          justify="center"
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
                                w="50%"
                                p="24px 24px"
                                my="16px"
                                border="1px solid #e1e1e1"
                                //  borderWidth="2px"
                                // borderColor="red"
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
                                      <Link to={"/AddToCart/" + post.id}>
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

                              <GridItem
                                className="gridItem"
                                p="6px"
                                key={post.id}
                                colSpan={1}
                                rowSpan={1}
                                _hover={{
                                  boxShadow: "0 3px 2px #e9e9e9",
                                  transform: "translateY(-3px)",
                                }}
                                onClick={() => {
                                  // console.log(post.id);
                                }}
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

                                  {/* <Text
                                    as="kbd"
                                    fontSize="10px"
                                    color="gray.500"
                                  >
                                    {formatDistanceToNow(post.createdAt)} ago
                                  </Text>
                                  <Button variant="link" color="#333333">
                                    {post.authorName}
                                  </Button> */}

                                  <Flex
                                    w="100%"
                                    align="center"
                                    justify="center"
                                  >
                                    <Image
                                      src={post.postImage}
                                      objectFit="cover"
                                      w="100%"
                                      h="250px"
                                      alt="post image"
                                      onError={(e) =>
                                        (e.target.style.display = "none")
                                      }
                                    />
                                  </Flex>
                                  <Flex
                                    pl="32px"
                                    py="32px"
                                    justify="space-between"
                                  >
                                    <Box>
                                      <Link to={"/AddToCart/" + post.id}>
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

                                    <Box mr="34px">
                                      {!post.price ? (
                                        <Text>₱ 0.00</Text>
                                      ) : (
                                        <>
                                          <strong>₱ </strong>
                                          {post.price}
                                        </>
                                      )}
                                    </Box>
                                  </Flex>

                                  {/* <Flex
                                    w="100%"
                                    align="center"
                                    justify="center"
                                  >
                                    <Image
                                      src={post.postImage}
                                      objectFit="cover"
                                      w="100%"
                                      h="250px"
                                      alt="post image"
                                      onError={(e) =>
                                        (e.target.style.display = "none")
                                      }
                                    />
                                  </Flex> */}
                                  {/* <Box w="100%">
                                    <Comment
                                      postID={post.id}
                                      authorId={post.authorId}
                                    />
                                  </Box> */}
                                </Flex>
                                {/* </Card> */}
                              </GridItem>
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
                                    {userData.phoneNumber}
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
