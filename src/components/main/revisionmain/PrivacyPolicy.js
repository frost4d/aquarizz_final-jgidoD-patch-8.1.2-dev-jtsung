import React from 'react';
import { Box, Heading, Text, List, ListItem } from "@chakra-ui/react";

const PrivacyPolicy = () => {
  return (
    <Box p={5}>
      <Heading mb={5}>Privacy Policy</Heading>
      <Text mb={5}>
      Welcome to AQUARIZZ, a social media platform and e-commerce site dedicated to fish keeping enthusiasts. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you visit and interact with our platform. By using AQUARIZZ, you agree to the practices described in this policy.
</Text>
      
      <Heading size="md" mb={5}>Information We Collect</Heading>
      <Heading size="sm" mb={3}>1.1 Personal Information</Heading>
      <Text mb={3}>
        We collect information to provide better services to our users. The information we collect includes:
      </Text>
      <List spacing={3} mb={5}>
        <ListItem>
          Personal identification information (Name, email address, phone number, etc.)
        </ListItem>
        <Heading size="sm" mb={2}>1.2 Non-Personal Information</Heading>
        <ListItem>
          Log data (IP address, browser type, etc.)
        </ListItem>
        <Heading size="sm" mb={1}>1.3 Cookies and Tracking Technologies</Heading>
        <ListItem>
          Cookies and usage data
        </ListItem>
      </List>

      <Heading size="md" mb={2}>How We Use Information</Heading>
      <Text mb={3}>
        We use the collected data for various purposes:
      </Text>
      <List spacing={3} mb={5}>
        <ListItem>
          To provide and maintain our service
        </ListItem>
        <ListItem>
          To notify you about changes to our service
        </ListItem>
        <ListItem>
          To provide customer support
        </ListItem>
        <ListItem>
          To gather analysis or valuable information so that we can improve our service
        </ListItem>
      </List>

      <Heading size="md" mb={2}>Data Protection</Heading>
      <Text mb={3}>
        We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
      </Text>

      <Heading size="md" mb={2}>Changes to This Privacy Policy</Heading>
      <Text mb={3}>
        We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately, after they are posted on this page.
      </Text>

      <Heading size="md" mb={2}>Contact Us</Heading>
      <Text mb={3}>
        If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at aquarizzcustomersupprt@gmail.com or through our contact us system.
      </Text>
    </Box>
  );
};

export default PrivacyPolicy;
