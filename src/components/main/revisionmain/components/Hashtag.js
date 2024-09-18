import {
    Box,
    CardBody,
    Input,
    Text,
    Card,
    Select,
    ListItem,
    List,
    ListIcon,
  } from "@chakra-ui/react";
  import { useEffect, useState } from "react";
  import {
    collection,
    addDoc,
    docRef,
    getDocs,
    getDoc,
  } from "firebase/firestore";
  import { db } from "../../../../firebase/firebaseConfig";
  
  const Hashtag = () => {
    const [hashtag, setHashtag] = useState();
    const [hashtagList, setHashtagList] = useState();
    const [inputValue, setInputValue] = useState();
    const [filteredOptions, setFilteredOptions] = useState();
  
    const handleAddHashtag = (e) => {
      if (e.key === "Enter" && hashtag.trim() !== "") {
        setHashtag([...hashtagList, hashtag.trim()]);
      }
    };
  
    useEffect(() => {
      const handleGetHashtags = async () => {
        const hashtagRef = collection(db, "hashtags");
        const snapShot = await getDocs(hashtagRef);
        const tempTag = [];
        snapShot.forEach((doc) => {
          tempTag.push(doc.data());
        });
        setHashtagList(tempTag);
      };
      handleGetHashtags();
    }, []);
  
    //   console.log(hashtagList.map((tag) => tag.hashtag));
  
    const handleTagChange = (e) => {
      const input = e.target.value.toLowerCase();
      setInputValue(input);
  
      if (input) {
        const filtered = hashtagList.filter((tag) => {
          return tag.hashtag.toLowerCase().includes(input);
        });
        console.log(filtered);
        setFilteredOptions(filtered);
      } else {
        setFilteredOptions([]); // Clear the list if input is empty
      }
      // if (input) {
      //   //   const filteredData = hashtagList.filter((item) => {
      //   //     return item.hashtag.toLowerCase().includes(input);
      //   //     //  || item.authorName.toLowerCase().includes(input)
      //   //   });
      //   //   setInputValue(filteredData);
      // } else {
      //   //   setInputValue([]);
      // }
    };
    return (
      <Box position="relative">
        <Box>
          <Input
            placeholder="e.g #hashtag"
            value={inputValue || ""}
            onChange={handleTagChange}
            //   onKeyDown={handleAddHashtag}
          />
        </Box>
        <List w="100%" bg="#fff" position="absolute" zIndex="2">
          {filteredOptions &&
            filteredOptions.length > 0 &&
            filteredOptions.map((data) => {
              return (
                <ListItem
                  cursor="pointer"
                  key={data.id}
                  _hover={{ bg: "#f8f5f5" }}
                  p="6px 8px"
                >
                  <Text fontWeight="500" fontSize="sm">
                    {data.hashtag}
                  </Text>
                </ListItem>
              );
            })}
        </List>
      </Box>
    );
  };
  export default Hashtag;