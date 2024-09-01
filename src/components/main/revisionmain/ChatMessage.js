import React, { useState, useEffect } from 'react';
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Avatar,
  Flex,
  Card,
} from '@chakra-ui/react';
import { db } from "../../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
  getDoc,
  doc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Navigation from './Navigation';
import { useParams } from 'react-router-dom';

const ChatMessage = () => {
  const { userId } = useParams();
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [currentUserName, setCurrentUserName] = useState('');

  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users1');
      const userSnapshot = await getDocs(usersCollection);
      const usersList = userSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log('Fetched users:', usersList); // Debug log
      setUsers(usersList);
      setActiveUser(usersList[0]);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      const fetchCurrentUser = async () => {
        const userDoc = await getDoc(doc(db, 'users1', currentUserId));
        const userData = userDoc.data();
        setCurrentUserName(userData?.name || '');
      };

      fetchCurrentUser();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (activeUser && currentUserId) {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('senderId', 'in', [currentUserId, activeUser.id]),
        where('receiverId', 'in', [currentUserId, activeUser.id]),
        orderBy('createdAt')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => doc.data());
        setMessages(newMessages);
      });

      return () => unsubscribe();
    }
  }, [activeUser, currentUserId]);

  const handleSend = async () => {
    if (inputValue.trim() !== '' && activeUser) {
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        text: inputValue,
        senderId: currentUserId,
        senderName: currentUserName,
        receiverId: activeUser.id,
        receiverName: activeUser.name,
        createdAt: new Date(),
      });

      setInputValue('');
    }
  };

  const handleUserClick = (user) => {
    setActiveUser(user);
  };

  return (
    <Box h="100vh" overflowY="auto">
      <Navigation cartItemCount={cartItemCount} setCartItemCount={setCartItemCount} />
      <Flex h="90vh" w="100%" bg="gray.100" px="24" py="4">
        <Card w="25%" h="100%" p={4} bg="white" borderRight="1px solid #eaeaea">
          <VStack align="stretch" spacing={4} overflowY="auto" maxH="100%">
            {users.map((user) => (
              <HStack
                key={user.id}
                onClick={() => handleUserClick(user)}
                cursor="pointer"
                bg={activeUser && activeUser.id === user.id ? 'blue.50' : 'white'}
                p={2}
                borderRadius="md"
              >
                <Avatar src={user.profileImage} size="md" />
                <Text fontWeight="bold">{user.name}</Text>
              </HStack>
            ))}
          </VStack>
        </Card>

        <Card flex="1" display="flex" flexDirection="column" ml="4">
          <VStack flex="1" p={4} spacing={4} overflowY="auto">
            {messages.map((message, index) => (
              <Flex
                key={index}
                alignSelf={message.senderId === currentUserId ? 'flex-end' : 'flex-start'}
                maxW="60%"
                flexDirection="row"
                mb={2} // Add margin-bottom for better spacing
              >
                {message.senderId !== currentUserId && <Avatar size="sm" mr={2} />}
                <Box
                  bg={message.senderId === currentUserId ? 'blue.500' : 'gray.200'}
                  color={message.senderId === currentUserId ? 'white' : 'black'}
                  p={3}
                  borderRadius="lg"
                  borderBottomRightRadius={message.senderId === currentUserId ? '0' : 'lg'}
                  borderBottomLeftRadius={message.senderId !== currentUserId ? '0' : 'lg'}
                >
                  <Text fontSize="md">
                    <strong>{message.senderId === currentUserId ? 'You' : message.senderName}</strong>:
                  </Text>
                  <Text fontSize="md">
                    {message.text}
                  </Text>
                </Box>
              </Flex>
            ))}
          </VStack>

          <Card p={4} bg="white" borderTop="1px solid #eaeaea">
            <HStack>
              <Input
                placeholder={`Message ${activeUser ? activeUser.name : 'user'}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                borderRadius="full"
                bg="gray.100"
              />
              <Button colorScheme="blue" borderRadius="full" onClick={handleSend}>
                Send
              </Button>
            </HStack>
          </Card>
        </Card>
      </Flex>
    </Box>
  );
};

export default ChatMessage;
