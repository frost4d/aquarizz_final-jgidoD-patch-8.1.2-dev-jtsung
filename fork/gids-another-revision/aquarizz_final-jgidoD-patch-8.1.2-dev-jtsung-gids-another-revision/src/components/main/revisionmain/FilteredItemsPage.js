import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Flex, Input, Button, Text, Image } from '@chakra-ui/react';
import { Card, CardBody } from '@chakra-ui/card';
import { db } from '../../../firebase/firebaseConfig'; // Adjust the path if needed
import { collection, getDocs, addDoc } from 'firebase/firestore';
import Navigation from './Navigation';
import { formatDistanceToNow } from 'date-fns';
import './Discover.css';
import { useToast, useDisclosure  } from "@chakra-ui/react";
import AddDiscoverModal from './AddDiscoverModal';
import { UserAuth } from '../../context/AuthContext';
import { Plus } from 'react-feather';

const FilteredItemsPage = () => {
  const { categoryName } = useParams();
  const [filteredPosts, setFilteredPosts] = useState([]);
  const { user } = UserAuth();
  const addDiscover = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetchFilteredPosts = async () => {
      const postsCollection = collection(db, "shop");
      const querySnapshot = await getDocs(postsCollection);
      const tempPosts = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.tag.toLowerCase() === categoryName.toLowerCase()) {
          tempPosts.push({ id: doc.id, ...data });
        }
      });
      setFilteredPosts(tempPosts);
    };
    fetchFilteredPosts();
  }, [categoryName]);

  const handleSearchDiscover = (event) => {
    event.preventDefault();
    // Add search functionality if needed
  };

  const handleAddDiscover = (formData) => {
    // Add logic to save the form data to your database or state
    console.log(formData);
    addDoc(collection(db, "discover"), formData);
    setFilteredPosts([...filteredPosts, formData]);
    addDiscover.onClose(); // Close the modal after submitting
    toast({
      title: "Post Created.",
      description: "Post successfully published.",
      status: "success",
      duration: 5000,
      position: "top",
    });
  };

  return (
    <Box h="100vh">
      <Navigation />
      <Flex justify="space-between" p="0 86px 0px 64px">
        <Heading>{categoryName} Posts</Heading>
        <Flex display={user ? "flex" : "none"} justify="space-between">
          <Button
            mr="12px"
            variant="ghost"
            leftIcon={<Plus size={16} />}
            onClick={addDiscover.onOpen}
          >
            <AddDiscoverModal
              isOpen={addDiscover.isOpen}
              onClose={addDiscover.onClose}
            />
            Create
          </Button>
          <Button variant="ghost" color="#333333">
            My Shop
          </Button>
        </Flex>
      </Flex>

      <Box p="24px">
        <Flex
          gap="24px 24px"
          flexWrap="wrap"
          justify="space-evenly"
          align="center"
          mt="32px"
        >
          <Flex w="100%" justify="center" p="12px 24px">
            <form onSubmit={handleSearchDiscover}>
              <Flex w="100%" justify="space-between">
                <Input borderRadius="24px" placeholder="Search" />
                <Button p="12px 24px" type="submit" borderRadius="24px">
                  Search
                </Button>
              </Flex>
            </form>
          </Flex>
          <Flex
            w="100%"
            gap="24px 12px"
            justify="center"
            align="center"
            flexWrap="wrap"
          >
            {filteredPosts.map((post) => (
              <Card key={post.id} w="400px" h="600px" border="1px solid #e1e1e1">
                <CardBody>
                  <Flex>
                    <Box w="100%">
                      <Image
                        objectFit="cover"
                        w="100%"
                        h="350px"
                        src={post.postImage}
                        alt="Post Image"
                      />
                    </Box>
                  </Flex>
                  <Flex justify="space-between" mt="24px">
                    <Button variant="link" color="#333333">
                      {post.authorName}
                    </Button>
                    <Text fontSize="xs" color="#6e6e6e" as="i">
                      {formatDistanceToNow(post.createdAt)} ago
                    </Text>
                  </Flex>
                    <Text fontSize="sm" color="#6e6e6e" mt="12px">
                      Tag: {post.tag}
                    </Text>
                  <Box mt="12px">
                    <Text fontSize="sm" color="#6e6e6e" className="truncate" textAlign="justify">
                      {post.postContent}
                    </Text>
                  </Box>
                </CardBody>
              </Card>
            ))}
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default FilteredItemsPage;

