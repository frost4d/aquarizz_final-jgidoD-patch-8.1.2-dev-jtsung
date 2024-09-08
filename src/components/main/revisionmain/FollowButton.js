import React, { useState, useEffect } from 'react';
import { Button, Flex, useToast, Box, Text, HStack } from '@chakra-ui/react';
import { UserPlus, UserCheck, Edit3 } from 'react-feather';
import { db } from '../../../firebase/firebaseConfig'; // Adjust path if needed
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

      setIsFollowing(false);
      setFollowersCount((prevCount) => prevCount - 1); // Update followers count in UI
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const isOwnProfile = userId === user?.uid;

  return (
    <Flex direction="column" alignItems="end" border="2px">
      {isOwnProfile ? (
        <Button
          leftIcon={<Edit3 />}
          colorScheme="teal"
          mb={4} // Adds spacing between the button and the counts
        >
          Edit Profile
        </Button>
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
