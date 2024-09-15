import React, { useState, useEffect } from 'react';
import { Button, Flex, useToast, Box, Text, HStack, useDisclosure, Modal, ModalBody, ModalOverlay,ModalContent, ModalHeader, ModalFooter, FormLabel, Input, Image, VStack } from '@chakra-ui/react';
import { UserPlus, UserCheck, Edit3, Edit2 } from 'react-feather';
import { db, storage } from '../../../firebase/firebaseConfig'; // Adjust path if needed
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, updateDoc, getDoc, getDocs, collection, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { arrayUnion, arrayRemove } from 'firebase/firestore';
import { UserAuth } from '../../context/AuthContext';

const FollowButton = ({ userId, currentUserId, followCount }) => {
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const toast = useToast();
  const { user } = UserAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [location, setLocation] = useState(user?.location || "");
  const [newPassword, setNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(user?.photoURL || "");
  const profileModal = useDisclosure();
  const followersModal = useDisclosure();
  const followingModal = useDisclosure();
  const friendsModal = useDisclosure();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const followersRef = collection(db, `users1/${userId}/followers`);
    const unsubscribe = onSnapshot(followersRef, (snapshot) => {
      setFollowersCount(snapshot.size); // Update followers count in real-time
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [userId]);

  // Real-time listener for friends count
  useEffect(() => {
    if (!user?.uid) return;

    const friendsRef = collection(db, `users1/${user?.uid}/friends`);
    const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
      setFriendsCount(snapshot.size); // Update friends count in real-time
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [user?.uid]);

  useEffect(() => {
    if (!userId) return;

    const fetchCounts = async () => {
      // Get followers count
      const followersSnapshot = await getDocs(
        collection(db, `users1/${userId}/followers`)
      );
      setFollowersCount(followersSnapshot.size);

      // Get following count
      const followingSnapshot = await getDocs(
        collection(db, `users1/${userId}/following`)
      );
      setFollowingCount(followingSnapshot.size);

      // Get friends count
      const friendsSnapshot = await getDocs(
        collection(db, `users1/${userId}/friends`)
      );
      setFriendsCount(friendsSnapshot.size);
    };

    fetchCounts();
  }, [userId]);

  // useEffect(() => {
  //   if (!userId || !user) return;

  //   // Check if the current user is following the profile's user
  //   const checkIfFollowing = async () => {
  //     const docRef = doc(db, `users1/${user.uid}/following`, userId);
  //     const docSnap = await getDoc(docRef);
  //     setIsFollowing(docSnap.exists());
  //   };

  //   checkIfFollowing();
  // }, [userId, user]);

  const handleFollow = async () => {
    if (!userId || !user) return;
  
    try {
      // Fetch the followed user's info from Firestore
      const followedUserDoc = await getDoc(doc(db, `users1/${userId}`));
      if (!followedUserDoc.exists()) {
        console.error("Followed user does not exist");
        return;
      }
      const followedUserData = followedUserDoc.data();

      const currentUserDoc = await getDoc(doc(db, `users1/${user.uid}`));
    if (!currentUserDoc.exists()) {
      console.error("Current user does not exist.");
      return;
    }

    const currentUserData = currentUserDoc.data();
  
      // Add to followers subcollection of the user being followed
      await setDoc(doc(db, `users1/${userId}/followers`, user.uid), {
        followerId: user.uid,
        followedAt: new Date(),
        name: currentUserData.name || user.displayName,  
        email: currentUserData.email || user.email,  
        postImage: imageUrl
      });
  
      // Add to following subcollection of the current user with the followed user's info
      await setDoc(doc(db, `users1/${user.uid}/following`, userId), {
        followedUserId: userId,
        followedAt: new Date(),
        name: followedUserData.name, // Now using followed user's name
        email: followedUserData.email,      // Now using followed user's email
        postImage: followedUserData.profileImage || "no img"  // Now using followed user's image
      });
  
      // Check if the followed user is also following you to add each other as friends
      const otherUserFollowersDoc = await getDoc(doc(db, `users1/${userId}/following`, user.uid));
      if (otherUserFollowersDoc.exists()) {
        // Add each other to friends subcollection
        await setDoc(doc(db, `users1/${user.uid}/friends`, userId), {
          friendId: userId,
          addedAt: new Date(),
          name: followedUserData.name,  // Use followed user's info
          email: followedUserData.email,
          postImage: followedUserData.profileImage || "no img"
        });
        await setDoc(doc(db, `users1/${userId}/friends`, user.uid), {
          friendId: user.uid,
          addedAt: new Date(),
          name: currentUserData.name || "Unknown User",
          email: user.email,
          postImage: imageUrl
        });
  
        setFriendsCount((prevCount) => prevCount + 1);
      }
  
      setIsFollowing(true);
      setFollowersCount((prevCount) => prevCount + 1);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };
  

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

  // const handleProfileChange = async (e) => {
  //   setProfileImage(e.target.files[0]);
  //   const imageRef = ref(
  //     storage,
  //     `profileImages/${e.target.files[0].name + "&" + user.displayName}`
  //   );
  //   try {
  //     await uploadBytes(imageRef, e.target.files[0]);
  //     const url = await getDownloadURL(imageRef);
  //     setImageUrl(url);
  //   } catch (err) {
  //     console.log(err.message);
  //   }
  // };

  // const handlePhoneNumberChange = (e) => {
  //   const value = e.target.value;
  //   // Only allow numbers and a max length of 10
  //   if (/^\d*$/.test(value) && value.length <= 10) {
  //     setPhoneNumber(value);
  //   }
  // };

  // const handleSubmitProfile = async () => {
  //   const userRef = doc(db, "users1", user.uid);

  //   try {
  //     // Update profile image
  //     await updateProfile(user, { photoURL: imageUrl });

  //     // Update Firestore
  //     await updateDoc(userRef, {
  //       profileImage: imageUrl,
  //       displayName: name,
  //       phoneNumber,
  //       location,
  //     });

  //     // Update password if provided
  //     if (newPassword) {
  //       await updatePassword(user, newPassword);
  //     }

  //     toast({
  //       title: "Profile Updated!",
  //       description: "Your profile has been updated successfully.",
  //       status: "success",
  //       duration: 3000,
  //       position: "top",
  //     });
  //   } catch (err) {
  //     toast({
  //       title: "Update Failed!",
  //       description: "There was an error updating your profile.",
  //       status: "error",
  //       duration: 3000,
  //       position: "top",
  //     });
  //   }
  // };

  // const isOwnProfile = userId === user?.uid;

  const fetchUsersList = async (collectionName) => {
    const snapshot = await getDocs(collection(db, `users1/${userId}/${collectionName}`));
    return snapshot.docs.map(doc => doc.data());
  };

  useEffect(() => {
    if (followersModal.isOpen) {
      fetchUsersList('followers').then(setFollowers);
    }
  }, [followersModal.isOpen, userId]);

  useEffect(() => {
    if (followingModal.isOpen) {
      fetchUsersList('following').then(setFollowing);
    }
  }, [followingModal.isOpen, userId]);

  useEffect(() => {
    if (friendsModal.isOpen) {
      fetchUsersList('friends').then(setFriends);
    }
  }, [friendsModal.isOpen, userId]);

  return (
    <Flex direction="column" alignItems="end">
      {/* {isOwnProfile ? (
        <>
        <Button colorScheme="teal" onClick={profileModal.onOpen} leftIcon={<Edit3 />}>
          Edit Profile
        </Button>
  
        <Modal isOpen={profileModal.isOpen} onClose={profileModal.onClose}>
            <ModalOverlay />
            <ModalContent maxW="lg" mx="auto" mt="5">
            <ModalHeader borderBottom="2px" borderColor="#e1e5ee">Edit Profile</ModalHeader>
              <ModalBody>
                <Flex direction="column" align="center" p="6">
                  <Box mb="4">
                    <FormLabel>Profile Image</FormLabel>
                    <Input type="file" accept="image/*" onChange={handleProfileChange} />
                    {profileImage && (
                      <Image
                        mt="2"
                        borderRadius="full"
                        boxSize="150px"
                        src={imageUrl}
                        alt="Profile Image"
                      />
                    )}
                  </Box>
                  <FormLabel mb="2">Name</FormLabel>
                  <Input
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    mb="4"
                  />
                  <FormLabel mb="2">Phone Number</FormLabel>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    maxLength={10}
                    mb="4"
                  />
                  <FormLabel mb="2">Location</FormLabel>
                  <Input
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    mb="4"
                  />
                  <FormLabel mb="2">New Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Enter a new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    mb="6"
                  />
                  
                </Flex>
              </ModalBody>
              <ModalFooter borderTop="2px" borderColor="#e1e5ee">
                    <Flex justifyContent="flex-end" minWidth="410px">
                  <Button
                    colorScheme="blue"
                    onClick={handleSubmitProfile}
                    mr="24px"
                    minWidth="100px"
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
                  </ModalFooter>
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
      )} */}

      <HStack spacing={8} mt="24px" fontSize="lg">
        <Box textAlign="center" onClick={followersModal.onOpen}>
          <HStack>
          <Text fontSize="lg" fontWeight="bold">
            {followersCount}
          </Text>
          <Text>Followers</Text>
          </HStack>
        </Box>
        <Box textAlign="center" onClick={followingModal.onOpen}>
          <HStack>
          <Text fontSize="lg" fontWeight="bold">
            {followingCount}
          </Text>
          <Text>Following</Text>
          </HStack>
        </Box>
        <Box textAlign="center" onClick={friendsModal.onOpen}>
          <HStack>
          <Text fontSize="lg" fontWeight="bold">
            {friendsCount}
          </Text>
          <Text>Friends</Text>
          </HStack>
        </Box>
      </HStack>

      <Modal isOpen={followersModal.isOpen} onClose={followersModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Followers</ModalHeader>
          <ModalBody>
            <VStack spacing="4">
            {followers.map((follower, index) => (
                <Box key={index}>
                  <Text>{follower.email}</Text>
                  <Text>{follower.name}</Text>
                  <Text>{follower.followerId}</Text>
                  <Image src={follower.postImage} alt={follower.name} boxSize="50px" borderRadius="full" border="2px"/>
                </Box>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={followersModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={followingModal.isOpen} onClose={followingModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Following</ModalHeader>
          <ModalBody>
            <VStack spacing="4">
            {following.map((following, index) => (
                <Box key={index}>
                  <Text>{following.email}</Text>
                  <Text>{following.name}</Text>
                  <Text>{following.followedUserId}</Text>
                  <Image src={following.postImage} alt={following.name} boxSize="50px" borderRadius="full" border="2px"/>
                </Box>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={followingModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={friendsModal.isOpen} onClose={friendsModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Friends</ModalHeader>
          <ModalBody>
            <VStack spacing="4">
            {friends.map((friend, index) => (
                <Box key={index}>
                  <Text>{friend.email}</Text>
                  <Text>{friend.name}</Text>
                  <Text>{friend.friendId}</Text>
                  <Image src={friend.postImage} alt={friend.name} boxSize="50px" borderRadius="full" border="2px"/>
                </Box>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={friendsModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default FollowButton;
