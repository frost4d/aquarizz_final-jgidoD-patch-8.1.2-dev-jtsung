import "./Footer.css";
import { useNavigate } from "react-router-dom";
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
import { Facebook, Instagram, Mail, Twitter } from "react-feather";
import { Link } from "react-router-dom";
const Footer = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${categoryName}`);
  };

  return (
    <>
      <Flex
        className="footerWrapper"
        bg="#efefef"
        align="center"
        justify="space-evenly"
        flexWrap="wrap"
        py="24px"
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
                <a
                  href="https://www.facebook.com/profile.php?id=61555612521494"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook size="18px" color="#3B5998" />
                </a>
              </Box>
              <Box
                onClick={() => {
                  window.location.href =
                    "mailto: aquarizzcustomersupprt@gmail.com";
                }}
              >
                <Mail size="18px" color="#FF0000" />
              </Box>
              {/* <Box>
                <Instagram size="18px" color="#1DA1F2" />
              </Box> */}
            </Flex>
          </Box>
        </Flex>

        <Flex
          className="footer__interaction"
          flex="1"
          justify="space-evenly"
          align="center"
        >
          {/* <Flex flexDirection="column" ml="32px">
            <Heading fontSize="xl" my="8px">
              Shop
            </Heading>
            <Box className="shopLink">
              <Text color="#333333" fontSize="sm" onClick={() => handleCategoryClick("Fish")}>
                Fish
              </Text>
              <Text color="#333333" fontSize="sm" onClick={() => handleCategoryClick("Accessories")}>
                Accessories
              </Text>
              <Text color="#333333" fontSize="sm" onClick={() => handleCategoryClick("Feeds")}>
                Feeds
              </Text>
              <Text color="#333333" fontSize="sm" onClick={() => handleCategoryClick("Aquarium")}>
                Aquarium
              </Text>
            </Box>
          </Flex> */}
          <Flex className="supportLink" flexDirection="column" mr="32px">
            <Box>
              <Heading size="lg" my="8px">
                About Us
              </Heading>
            </Box>

            <Flex gap="10" justify="space-between">
              <Box>
                <Link to="/contact-us">
                  <Text color="#333333" fontSize="sm">
                    Contact Us
                  </Text>
                </Link>

                <Link to="/faqs">
                  <Text color="#333333" fontSize="sm">
                    FAQs
                  </Text>
                </Link>
              </Box>
              <Box>
                <Link to="/return&exchange">
                  <Text color="#333333" fontSize="sm">
                    Returns & Exchanges
                  </Text>
                </Link>
                <Link to="/Privacypolicy">
                  <Text color="#333333" fontSize="sm">
                    Privacy Policy
                  </Text>
                </Link>
              </Box>

              <Link to="/terms-of-service">
                <Text color="#333333" fontSize="sm">
                  Terms of Service
                </Text>
              </Link>
            </Flex>
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
                  <Link to="/contact-us">
                    <Text color="#333333" fontSize="sm">
                      Contact Us
                    </Text>
                  </Link>
                  <Link to="/faqs">
                    <Text color="#333333" fontSize="sm">
                      FAQs
                    </Text>
                  </Link>
                  <Link to="/return&exchange">
                    <Text color="#333333" fontSize="sm">
                      Returns & Exchanges
                    </Text>
                  </Link>
                  <Link to="/Privacypolicy">
                    <Text color="#333333" fontSize="sm">
                      Privacy Policy
                    </Text>
                  </Link>
                  <Link to="/terms-of-service">
                    <Text color="#333333" fontSize="sm">
                      Terms of Service
                    </Text>
                  </Link>
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
