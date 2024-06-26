import { useState } from "react";

import "./SearchInput.css";

import { Box, Flex, Button, Input } from "@chakra-ui/react";
import { MapPin, Search } from "react-feather";
import { useForm } from "react-hook-form";

const SearchInput = ({ handleSearch, userLocation }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleSearchClick = (data) => {
    handleSearch(data.search, data.location);
  };
  return (
    <>
      <form onSubmit={handleSubmit(handleSearchClick)}>
        <Flex maxW="500%" mt="40px" justify="center" mx="32px">
          <Flex
            className="searchWrapper"
            align="center"
            justify="space-around"
            p="12px 16px"
            borderRadius="32px"
          >
            <Flex position="relative" w="100%">
              <Input
                id="search"
                placeholder="e.g. Accessories"
                mr="8px"
                borderRadius="24px"
                {...register("search", {
                  required: true,
                })}
                aria-invalid={errors?.search ? "true" : "false"}
              />
              <Box
                position="absolute"
                right="16px"
                bottom="-4px"
                transform="translateY(-50%)"
              >
                <Search />
              </Box>
            </Flex>
            <Flex position="relative" w="100%">
              <Input
                id="location"
                placeholder="e.g. Olongapo"
                ml="8px"
                borderRadius="24px"
                {...register("location", {
                  required: true,
                })}
                aria-invalid={errors?.location ? "true" : "false"}
              />
              <Box
                position="absolute"
                right="8px"
                bottom="-4px"
                transform="translateY(-50%)"
              >
                <MapPin />
              </Box>
            </Flex>
            <Flex className="btnFind" ml="12px">
              <Button id="findItemBtn" type="submit" borderRadius="24px">
                Find
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </form>
    </>
  );
};

export default SearchInput;
