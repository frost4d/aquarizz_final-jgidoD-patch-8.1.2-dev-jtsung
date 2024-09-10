import React, { useState, useEffect } from 'react';
import { Button, Flex, useToast, Box, Text, HStack, useDisclosure, Modal, ModalBody, ModalOverlay,ModalContent, FormLabel, Input, Image } from '@chakra-ui/react';
import { UserPlus, UserCheck, Edit3, Edit2 } from 'react-feather';
import { db, storage } from '../../../firebase/firebaseConfig'; // Adjust path if needed
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, updateDoc, getDoc, getDocs, collection, setDoc, deleteDoc } from 'firebase/firestore';
import { arrayUnion, arrayRemove } from 'firebase/firestore';
import { UserAuth } from '../../context/AuthContext';

const FollowButton = ({ userId, currentUserId }) => {
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

  useEffect(() => {
    if (!userId) return;

    const fetchCounts = async () => {
      // Get followers count
      const followersSnapshot = await getDocs(collection(db, `users1/${userId}/followers`));
      setFollowersCount(followersSnapshot.size);

      // Get following count
      const followingSnapshot = await getDocs(collection(db, `users1/${userId}/following`));
      setFollowingCount(followingSnapshot.size);

      // Get friends count
      const friendsSnapshot = await getDocs(collection(db, `users1/${userId}/friends`));
      setFriendsCount(friendsSnapshot.size);
    };

    fetchCounts();
  }, [userId]);

  const handleFollow = async () => {
    if (!userId || !user) return;

    try {
      // Add to followers subcollection of the user being followed
      await setDoc(doc(db, `users1/${userId}/followers`, user.uid), {
        followerId: user.uid,
        followedAt: new Date(),
      });

      // Add to following subcollection of the current user
      await setDoc(doc(db, `users1/${user.uid}/following`, userId), {
        followedUserId: userId,
        followedAt: new Date(),
      });

      const otherUserFollowersDoc = await getDoc(doc(db, `users1/${userId}/following`, user.uid));
      if (otherUserFollowersDoc.exists()) {
        // Add each other to friends subcollection if both are following each other
        await setDoc(doc(db, `users1/${user.uid}/friends`, userId), {
          friendId: userId,
          addedAt: new Date(),
        });
        await setDoc(doc(db, `users1/${userId}/friends`, user.uid), {
          friendId: user.uid,
          addedAt: new Date(),
        });

        setFriendsCount((prevCount) => prevCount + 1); // Update friends count in UI
      }

      setIsFollowing(true);
      setFollowersCount((prevCount) => prevCount + 1); // Update followers count in UI
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  // Unfollow a user
  const handleUnfollow = async () => {
    if (!userId || !user) return;

    try {
      // Remove from followers subcollection
      await deleteDoc(doc(db, `users1/${userId}/followers`, user.uid));

      // Remove from following subcollection
      await deleteDoc(doc(db, `users1/${user.uid}/following`, userId));

      const friendsSnapshot = await getDocs(collection(db, `users1/${userId}/friends`));
      const friendIds = friendsSnapshot.docs.map(doc => doc.id);
      if (friendIds.includes(user.uid)) {
        await deleteDoc(doc(db, `users1/${user.uid}/friends`, userId));
        await deleteDoc(doc(db, `users1/${userId}/friends`, user.uid));
        setFriendsCount((prevCount) => prevCount - 1); // Update friends count in UI
      }

      setIsFollowing(false);
      setFollowersCount((prevCount) => prevCount - 1); // Update followers count in UI
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const handleProfileChange = async (e) => {
    setProfileImage(e.target.files[0]);
    const imageRef = ref(
      storage,
      `profileImages/${e.target.files[0].name + "&" + user.displayName}`
    );
    try {
      await uploadBytes(imageRef, e.target.files[0]);
      const url = await getDownloadURL(imageRef);
      setImageUrl(url);
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

  const isOwnProfile = userId === user?.uid;

  return (
    <Flex direction="column" alignItems="end" border="2px">
      {isOwnProfile ? (
        <>
        <Button colorScheme="teal" onClick={profileModal.onOpen} leftIcon={<Edit3 />}>
          Edit Profile
        </Button>
  
        <Modal isOpen={profileModal.isOpen} onClose={profileModal.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalBody>
              <Flex direction="column" align="center" p="4">
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
                <FormLabel mt="4">Name</FormLabel>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FormLabel mt="4">Phone Number</FormLabel>
                <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                maxLength={10}
              />
                <FormLabel mt="4">Location</FormLabel>
                <Input
                  placeholder="Enter your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <FormLabel mt="4">New Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter a new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  mt="6"
                  colorScheme="blue"
                  onClick={handleSubmitProfile}
                >
                  Save Changes
                </Button>
                <Button
                  mt="2"
                  variant="outline"
                  onClick={profileModal.onClose}
                >
                  Cancel
                </Button>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
      ) : (
        <Button
          onClick={isFollowing ? handleUnfollow : handleFollow}
          leftIcon={isFollowing ? <UserCheck /> : <UserPlus />}
          colorScheme={isFollowing ? "teal" : "blue"}
          mb={4} // Adds spacing between the button and the counts
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}

      <HStack spacing={8}>
        <Box textAlign="center">
          <Text fontSize="lg" fontWeight="bold">{followersCount}</Text>
          <Text>Followers</Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="lg" fontWeight="bold">{followingCount}</Text>
          <Text>Following</Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="lg" fontWeight="bold">{friendsCount}</Text>
          <Text>Friends</Text>
        </Box>
      </HStack>
    </Flex>

  );
};

export default FollowButton;
