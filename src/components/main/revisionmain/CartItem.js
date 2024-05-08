import React from "react";
import { VStack, Text, List, ListItem, Button, Image, Flex, Divider } from "@chakra-ui/react";

const CartItem = ({ item, onRemove }) => {
  const handleRemove = () => {
    // Call the onRemove function with the item's id to remove it permanently
    onRemove(item.id);
  };
  return (
    <VStack align="stretch" spacing="4">
    <List spacing={3} mx={10}>
      <ListItem key={item.id} p={3} borderWidth="1px" borderRadius="md" style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <Flex>
          <Image src={item.postImage} alt={item.postTitle} boxSize="200px" objectFit="cover" />
          <VStack align="stretch" ml="4">
            <Text fontSize="xl" fontWeight="bold">
              {item.postTitle}
            </Text>
            <Text>{item.postContent}</Text>
            <Divider my={1} />
            <Text fontWeight="bold" >Price: P{item.price}</Text>
            <Button w="20" colorScheme="red" onClick={handleRemove}>Remove</Button>
          </VStack>
        </Flex>
      </ListItem>
    </List>
  </VStack>
  );
};

export default CartItem;
