import React, { useState, useEffect } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { UserPlus, UserCheck } from 'react-feather';
import { db } from '../../../firebase/firebaseConfig'; // Adjust path if needed
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { arrayUnion, arrayRemove } from 'firebase/firestore';

const FollowButton = ({ userId, currentUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const checkFollowing = async () => {
      try {
        const userDocRef = doc(db, 'users1', userId);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
        const followers = userData?.followers || [];
        setIsFollowing(followers.includes(currentUserId));
      } catch (error) {
        console.error("Error checking follow status: ", error);
      }
    };

    if (currentUserId) {
      checkFollowing();
    }
  }, [userId, currentUserId]);

  const handleFollow = async () => {
    try {
      const userDocRef = doc(db, 'users1', userId);
      const currentUserDocRef = doc(db, 'users1', currentUserId);

      await updateDoc(userDocRef, {
        followers: arrayUnion(currentUserId)
      });

      await updateDoc(currentUserDocRef, {
        following: arrayUnion(userId)
      });

      setIsFollowing(true);
      toast({
        title: "Followed!",
        description: "You are now following this user.",
        status: "success",
        duration: 3000,
        position: "top",
      });
    } catch (error) {
      console.error("Error following user: ", error);
      toast({
        title: "Error",
        description: "There was an error following this user.",
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  const handleUnfollow = async () => {
    try {
      const userDocRef = doc(db, 'users1', userId);
      const currentUserDocRef = doc(db, 'users1', currentUserId);

      await updateDoc(userDocRef, {
        followers: arrayRemove(currentUserId)
      });

      await updateDoc(currentUserDocRef, {
        following: arrayRemove(userId)
      });

      setIsFollowing(false);
      toast({
        title: "Unfollowed!",
        description: "You have unfollowed this user.",
        status: "success",
        duration: 3000,
        position: "top",
      });
    } catch (error) {
      console.error("Error unfollowing user: ", error);
      toast({
        title: "Error",
        description: "There was an error unfollowing this user.",
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  return (
    <Button
      onClick={isFollowing ? handleUnfollow : handleFollow}
      leftIcon={isFollowing ? <UserCheck /> : <UserPlus />}
      colorScheme={isFollowing ? "teal" : "blue"}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};

export default FollowButton;
