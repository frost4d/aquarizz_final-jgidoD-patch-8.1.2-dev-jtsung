import "./Footer.css";
import { useState } from "react";
import Contact from "../../Contact";
import {
  Box,
  Flex,
  Text,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from "@chakra-ui/react";
import { Facebook, Mail, Twitter } from "react-feather";
const Footer = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
      <Flex
        className="footerWrapper"
        bg="#efefef"
        align="center"
        justify="space-evenly"
        flexWrap="wrap"
        py="16px"
        mt="24px"
      >
        <Flex
          className="footerContents"
          flexWrap="wrap"
          align="center"
          justify="center"
          flexDirection="column"
          flex="1"
          
        >
          <Flex align="center" justify="center" mt="12px" w="100%">
            <Box className="footer__imageWrapper"></Box>
          </Flex>
          <Box className="addressWrapper">
            <Text fontSize="xs" color="#333333">
              Gordon College, Olongapo City
            </Text>
            {/* <Text fontSize="xs" color="#333333">
        
      </Text> */}
            <Flex
              flexWrap="wrap"
              className="socialLink"
              justify="space-evenly"
              align="center"
            >
              <Box>
                <Facebook size="18px" color="#3B5998" />
              </Box>
              <Box>
                <Mail size="18px" color="#FF0000" />
              </Box>
              <Box>
                <Twitter size="18px" color="#1DA1F2" />
              </Box>
            </Flex>
          </Box>
        </Flex>

        <Flex
          className="footer__interaction"
          flex="1"
          justify="space-evenly"
          align="center"
        >
          <Flex flexDirection="column" ml="32px">
            <Heading fontSize="xl" my="8px">
              Shop
            </Heading>
            <Box className="shopLink">
              <Text color="#333333" fontSize="sm">
                Fish
              </Text>
              <Text color="#333333" fontSize="sm">
                Accessories
              </Text>
              <Text color="#333333" fontSize="sm">
                Feeds
              </Text>
              <Text color="#333333" fontSize="sm">
                Aquarium
              </Text>
            </Box>
          </Flex>
          <Flex className="supportLink" flexDirection="column" mr="32px">
            <Heading fontSize="xl" my="8px">
              About Us
            </Heading>
            <Box>
              <Text color="#333333" fontSize="sm">
                Contact Us
              </Text>
              <Text color="#333333" fontSize="sm">
                FAQs
              </Text>
              <Text color="#333333" fontSize="sm">
                Returns & Exchanges
              </Text>
              <Text color="#333333" fontSize="sm">
                Privacy Policy
              </Text>
              <Text color="#333333" fontSize="sm">
                Terms of Service
              </Text>
            </Box>
          </Flex>
        </Flex>

        <Box className="footer_accordion">
          <Accordion allowMultiple>
            <AccordionItem>
              <AccordionButton _hover={{ bg: "none" }}>
                <Heading size="md">Shop</Heading>

                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Box className="shopLink">
                  <Text color="#333333" fontSize="sm">
                    Fish
                  </Text>
                  <Text color="#333333" fontSize="sm">
                    Accessories
                  </Text>
                  <Text color="#333333" fontSize="sm">
                    Feeds
                  </Text>
                  <Text color="#333333" fontSize="sm">
                    Aquarium
                  </Text>
                </Box>
              </AccordionPanel>
            </AccordionItem>
            {/* </Accordion> */}
            {/* <Accordion defaultIndex={[0]} allowMultiple> */}
            <AccordionItem>
              <AccordionButton _hover={{ bg: "none" }}>
                <Heading size="md">About us</Heading>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Box>
                  <Text color="#333333" fontSize="sm" onClick={() => setIsContactModalOpen(true)}>
                    Contact Us
                  </Text>
                  <Contact isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

                  <Text color="#333333" fontSize="sm">
                    FAQs
                  </Text>
                  <Text color="#333333" fontSize="sm">
                    Returns & Exchanges
                  </Text>
                  <Text color="#333333" fontSize="sm">
                    Privacy Policy
                  </Text>
                  <Text color="#333333" fontSize="sm">
                    Terms of Service
                  </Text>
                </Box>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      </Flex>
    </>
  );
};
export default Footer;
