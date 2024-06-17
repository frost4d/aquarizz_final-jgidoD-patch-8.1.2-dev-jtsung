import React from "react";
import {
  VStack,
  Text,
  List,
  ListItem,
  Button,
  Image,
  Flex,
  Divider,
  Card,
  CardBody,
  Box,
  Heading,
} from "@chakra-ui/react";
import { Trash2 } from "react-feather";
import "./CartItem.css";
const CartItem = ({ item, onRemove, isChecked, onCheckboxChange }) => {
  const handleRemove = () => {
    // Call the onRemove function with the item's id to remove it permanently
    onRemove(item.id);
  };
  return (
    <Flex maxW="1200px">
      <Flex align="start" mx={10}>
        <Card border="1px solid #e1e1e1" key={item.id} p={3} borderRadius="md">
          <CardBody>
            <Flex align="center ">
              <Image
                src={item.postImage}
                alt={item.postTitle}
                boxSize="100px"
                objectFit="cover"
              />
              <Flex className="cardItem" align="start" ml="4">
                <Box className="cardItem__details">
                  <Text fontSize="xl" fontWeight="bold">
                    {item.postTitle}
                  </Text>
                  <Text>{item.postContent.substring(0, 150)} . . .</Text>
                  <Heading size="sm">Quantity: {item.quantity}</Heading>
                  <Heading size="sm">
                    Total: &#8369;
                    {item.quantity ? item.price * item.quantity : ""}
                  </Heading>
                </Box>
                {/* <Divider my={1} /> */}
                <Box px="5px">
                  {/* <Text as="b">&#8369; {item.price}</Text> */}
                  <Button mt="20" size="md" colorScheme="red" onClick={handleRemove}>
                    <Trash2 size={16} />
                  </Button>
                </Box>
              </Flex>
            </Flex>
          </CardBody>
        </Card>
      </Flex>
    </Flex>
  );
};

export default CartItem;
