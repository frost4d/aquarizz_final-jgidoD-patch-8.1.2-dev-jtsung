import React, { useState, useEffect, useRef } from 'react';
import {
  Button, Flex, useToast, Box, Text, HStack, useDisclosure, Modal, ModalBody,
  ModalOverlay, ModalContent, ModalHeader, Tabs, TabList, TabPanels, TabPanel, Tab,
  VStack, Avatar
} from '@chakra-ui/react';
import { db } from '../../../firebase/firebaseConfig'; // Adjust path if needed
import { doc, setDoc, getDoc, collection, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';
import { UserAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FollowButton = ({ userId, currentUserId }) => {
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [friends, setFriends] = useState([]);
  const { user } = UserAuth();
  const toast = useToast();
  const navigate = useNavigate(); 
  const profileModal = useDisclosure();
  const tabsRef = useRef();  // Ref for tabs
  const [selectedTabIndex, setSelectedTabIndex] = useState(0); // Track which tab is selected
  const [followStatus, setFollowStatus] = useState({});
  const [imageUrl, setImageUrl] = useState();

  useEffect(() => {
    if (!userId || !user) return;

    // Check if the current user is following the profile's user
    const checkIfFollowing = async () => {
      const docRef = doc(db, `users1/${user.uid}/following`, userId);
      const docSnap = await getDoc(docRef);
      setIsFollowing(docSnap.exists());
    };

    checkIfFollowing();
  }, [userId, user, profileModal.isOpen]);
  
  // const fetchUsersList = async (collectionName) => {
  //   const snapshot = await getDocs(collection(db, `users1/${userId}/${collectionName}`));
  //   const usersList = snapshot.docs.map(doc => doc.data());
  //   return usersList;
  // };
  const fetchUsersList = async (collectionName) => {
    const snapshot = await getDocs(collection(db, `users1/${userId}/${collectionName}`));
    return snapshot.docs.map(doc => doc.data());
  };

  // Fetch the lists of followers, following, and friends when modal is open
  useEffect(() => {
    if (profileModal.isOpen) {
      Promise.all([
        fetchUsersList('followers').then(users => {
          setFollowers(users);
          const status = users.reduce((acc, user) => {
            acc[user.followerId] = true;
            return acc;
          }, {});
          setFollowStatus(prevState => ({ ...prevState, followers: status }));
        }),
        fetchUsersList('following').then(users => {
          setFollowing(users);
          const status = users.reduce((acc, user) => {
            acc[user.followedUserId] = true;
            return acc;
          }, {});
          setFollowStatus(prevState => ({ ...prevState, following: status }));
        }),
        fetchUsersList('friends').then(users => {
          setFriends(users);
          const status = users.reduce((acc, user) => {
            acc[user.friendId] = true;
            return acc;
          }, {});
          setFollowStatus(prevState => ({ ...prevState, friends: status }));
        })
      ]);
    }
  }, [profileModal.isOpen, userId]);

  // Check if the current user is following each other user
  useEffect(() => {
    if (!user || !userId) return;

    const checkFollowStatus = async () => {
      const followingSnapshot = await getDocs(collection(db, `users1/${user.uid}/following`));
      const status = followingSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = true; // Mark as following
        return acc;
      }, {});
      setFollowStatus(status); // Set the follow status for all followed users
    };

    checkFollowStatus();
  }, [user, userId]);

  // Check if mutual following exists
  const checkMutualFollowing = async (otherUserId) => {
    const otherUserFollowersSnapshot = await getDocs(collection(db, `users1/${otherUserId}/followers`));
    return otherUserFollowersSnapshot.docs.some(doc => doc.id === user.uid); // Check if the other user is already following the current user
  };

  // Add both users to each other's friends collection
  const addToFriends = async (otherUserId) => {
    const otherUserDoc = await getDoc(doc(db, `users1/${otherUserId}`));
    const currentUserDoc = await getDoc(doc(db, `users1/${user.uid}`));

    if (otherUserDoc.exists() && currentUserDoc.exists()) {
      const otherUserData = otherUserDoc.data();
      const currentUserData = currentUserDoc.data();

      // Add to friends collection for both users
      await setDoc(doc(db, `users1/${user.uid}/friends`, otherUserId), {
        friendId: otherUserId,
        name: otherUserData.name,
        email: otherUserData.email,
      });

      await setDoc(doc(db, `users1/${otherUserId}/friends`, user.uid), {
        friendId: user.uid,
        name: currentUserData.name || user.displayName,
        email: user.email,
      });

      setFriendsCount((prevCount) => prevCount + 1);
      toast({
        title: 'Added to friends.',
        status: 'success',
        duration: 2000,
      });
    }
  };

  // Fetch counts and lists
  useEffect(() => {
    if (!userId) return;

    const fetchCounts = async () => {
      const followersSnapshot = await getDocs(collection(db, `users1/${userId}/followers`));
      const followingSnapshot = await getDocs(collection(db, `users1/${userId}/following`));
      const friendsSnapshot = await getDocs(collection(db, `users1/${userId}/friends`));

      setFollowersCount(followersSnapshot.size);
      setFollowingCount(followingSnapshot.size);
      setFriendsCount(friendsSnapshot.size);
    };

    fetchCounts();
  }, [userId]);

  const handleFollow = async (otherUserId) => {
    if (!otherUserId || !user) return;

    try {
      const otherUserDoc = await getDoc(doc(db, `users1/${otherUserId}`));
      const currentUserDoc = await getDoc(doc(db, `users1/${user.uid}`));

      if (otherUserDoc.exists() && currentUserDoc.exists()) {
        const otherUserData = otherUserDoc.data();
        const currentUserData = currentUserDoc.data();

        // Add to followers
        await setDoc(doc(db, `users1/${otherUserId}/followers`, user.uid), {
          followerId: user.uid,
          name: currentUserData.name || user.displayName,
          email: user.email,
        });

        // Add to following
        await setDoc(doc(db, `users1/${user.uid}/following`, otherUserId), {
          followedUserId: otherUserId,
          name: otherUserData.name,
          email: otherUserData.email,
        });

        setFollowStatus((prevState) => ({
          ...prevState,
          [otherUserId]: true, // Mark the user as followed
        }));

        setFollowersCount((prevCount) => prevCount + 1);

        // Check for mutual following
        const isMutualFollowing = await checkMutualFollowing(otherUserId);
        if (isMutualFollowing) {
          await addToFriends(otherUserId); // Add both users to friends if mutual following exists
        }

        toast({
          title: 'Followed user.',
          status: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (otherUserId) => {
    if (!otherUserId || !user) return;

    try {
      await deleteDoc(doc(db, `users1/${otherUserId}/followers`, user.uid));
      await deleteDoc(doc(db, `users1/${user.uid}/following`, otherUserId));

      setFollowStatus((prevState) => ({
        ...prevState,
        [otherUserId]: false, // Mark the user as not followed
      }));

      setFollowersCount((prevCount) => prevCount - 1);

      // Optionally, remove from friends if unfollowed
      await deleteDoc(doc(db, `users1/${otherUserId}/friends`, user.uid));
      await deleteDoc(doc(db, `users1/${user.uid}/friends`, otherUserId));

      setFriendsCount((prevCount) => prevCount - 1);

      toast({
        title: 'Unfollowed user.',
        status: 'info',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  // Helper function to move the current user to the top of the list
const moveToTop = (usersList) => {
  // Check if the current user is in the list
  const currentUserIndex = usersList.findIndex(userItem => userItem.id === user.uid);
  if (currentUserIndex !== -1) {
    const currentUser = usersList.splice(currentUserIndex, 1)[0]; // Remove the current user from the list
    return [currentUser, ...usersList]; // Place the current user at the top
  }
  return usersList; // If the current user is not found, return the list unchanged
};

  // Render the follow/unfollow button
  const renderFollowButton = (otherUserId) => {
    if (otherUserId === user.uid) {
      return (
        <Button minWidth="100px" colorScheme="blue" fontSize="12px" onClick={() => navigateToProfile(otherUserId)}>
          View Profile
        </Button>
      );
    }

    const isFollowing = followStatus[otherUserId] || false; // Check if following or default to false

    return (
      <Button
        // size="sm"
        minWidth="100px"
        colorScheme={isFollowing ? 'teal' : 'blue'}
        onClick={() => (isFollowing ? handleUnfollow(otherUserId) : handleFollow(otherUserId))}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    );
  };

  // Handle click to open the modal and show the respective tab
  const handleTabClick = (index) => {
    setSelectedTabIndex(index); // Update the state with the clicked tab index
    profileModal.onOpen(); // Open the modal
  };

  const navigateToProfile = (profileId) => {
    profileModal.onClose();
    navigate(`/profile/${profileId}`); // Adjust path if needed
  };

  return (
    <Flex direction="column" alignItems="end">
      <HStack spacing={8} mt="24px" fontSize="lg">
        <Box textAlign="center" onClick={() => handleTabClick(0)} cursor="pointer">
          <HStack>
            <Text fontSize="lg" fontWeight="bold">{followersCount}</Text>
            <Text>Followers</Text>
          </HStack>
        </Box>
        <Box textAlign="center" onClick={() => handleTabClick(1)} cursor="pointer">
          <HStack>
            <Text fontSize="lg" fontWeight="bold">{followingCount}</Text>
            <Text>Following</Text>
          </HStack>
        </Box>
        <Box textAlign="center" onClick={() => handleTabClick(2)} cursor="pointer">
          <HStack>
            <Text fontSize="lg" fontWeight="bold">{friendsCount}</Text>
            <Text>Friends</Text>
          </HStack>
        </Box>
      </HStack>

      <Modal size="xl" isOpen={profileModal.isOpen} onClose={profileModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">{ userId || 'User Profile'}</ModalHeader>
          <ModalBody>
            <Tabs isFitted variant="enclosed" index={selectedTabIndex} onChange={setSelectedTabIndex} ref={tabsRef}>
              <TabList>
                <Tab>Followers ({followersCount})</Tab>
                <Tab>Following ({followingCount})</Tab>
                <Tab>Friends ({friendsCount})</Tab>
              </TabList>
              <TabPanels>
                {/* Followers Tab */}
                <TabPanel>
                  {followers.length > 0 ? (
                    <VStack align="start">
                      {moveToTop(followers).map((follower, index) => (
                        <HStack key={index} width="100%" justifyContent="space-between" 
                        >
                          <HStack 
                          onClick={() => navigateToProfile(follower.followerId)}
                          cursor="pointer"
                          >
                            <Avatar src={follower.postImage} name={follower.name} />
                            <VStack my="12px" ml="4px">
                              <Box>
                                <Text fontSize="18px" fontWeight="bold">{follower.email}</Text>
                                <Text>{follower.name}</Text>
                              </Box>
                            </VStack>
                          </HStack>
                          {renderFollowButton(follower.followerId, 'followers')}
                          {/* <Flex justifyContent="end" alignItems="center">
                          <Button 
                          minWidth="100px"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (followStatus[follower.followerId]) {
                              handleUnfollow(follower.followerId);
                            } else {
                              handleFollow(follower.followerId);
                            }
                          }}
                          colorScheme={followStatus[follower.followerId] ? 'teal' : 'blue'}
                        >
                          {followStatus[follower.followerId] ? 'Unfollow' : 'Follow'}
                        </Button>
                          </Flex> */}
                        </HStack>
                      ))}
                    </VStack>
                  ) : <Text>No followers</Text>}
                </TabPanel>

                {/* Following Tab */}
                <TabPanel>
                  {following.length > 0 ? (
                    <VStack align="start">
                      {moveToTop(following).map((follow, index) => (
                        <HStack key={index} width="100%" justifyContent="space-between"
                        cursor="pointer"
                        >
                          <HStack
                          onClick={() => navigateToProfile(follow.followedUserId)}
                          >
                            <Avatar src={follow.postImage} name={follow.name} />
                            <VStack my="12px" ml="4px">
                              <Box>
                                <Text fontSize="18px" fontWeight="bold">{follow.email}</Text>
                                <Text>{follow.name}</Text>
                              </Box>
                            </VStack>
                          </HStack>
                          {renderFollowButton(follow.followedUserId, 'following')}
                          {/* <Flex justifyContent="end" alignItems="center">
                          <Button
                          minWidth="100px"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (followStatus[follow.followedUserId]) {
                              handleUnfollow(follow.followedUserId);
                            } else {
                              handleFollow(follow.followedUserId);
                            }
                          }}
                          colorScheme={followStatus[follow.followedUserId] ? 'teal' : 'blue'}
                        >
                          {followStatus[follow.followedUserId] ? 'Unfollow' : 'Follow'}
                        </Button>
                          </Flex> */}
                        </HStack>
                      ))}
                    </VStack>
                  ) : <Text>Not following anyone</Text>}
                </TabPanel>

                {/* Friends Tab */}
                <TabPanel>
                  {friends.length > 0 ? (
                    <VStack align="start">
                      {moveToTop(friends).map((friend, index) => (
                        <HStack key={index} width="100%" justifyContent="space-between" 
                        >
                          <HStack
                          onClick={() => navigateToProfile(friend.friendId)}
                          cursor="pointer"
                          >
                            <Avatar src={friend.postImage} name={friend.name} />
                            <VStack my="12px" ml="4px">
                              <Box>
                                <Text fontSize="18px" fontWeight="bold">{friend.email}</Text>
                                <Text>{friend.name}</Text>
                              </Box>
                            </VStack>
                          </HStack>
                          {renderFollowButton(friend.friendId, 'friends')}
                          {/* <Button
                          minWidth="100px"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (followStatus[friend.friendId]) {
                              handleUnfollow(friend.friendId);
                            } else {
                              handleFollow(friend.friendId);
                            }
                          }}
                          colorScheme={followStatus[friend.friendId] ? 'teal' : 'blue'}
                        >
                          {followStatus[friend.friendId] ? 'Unfollow' : 'Follow'}
                        </Button> */}
                        </HStack>
                      ))}
                    </VStack>
                  ) : <Text>No friends</Text>}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default FollowButton;
