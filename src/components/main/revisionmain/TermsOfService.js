import React, { useState } from "react";
import { Box, Heading, Text, List, ListItem } from "@chakra-ui/react";
import Footer from "./Footer";
import Navigation from "./Navigation";

const TermsOfService = () => {
  const [cartItemCount, setCartItemCount] = useState(0);

  return (
    <Box>
      <Navigation
        cartItemCount={cartItemCount}
        setCartItemCount={setCartItemCount}
      />
    <Box p={10}>
      <Heading mb={5} 
      // borderWidth="2px" borderColor="blue"
      >
        Terms of Service</Heading>
      <Text mb={3}>
        These terms and conditions outline the rules and regulations for the use
        of our website and services.
      </Text>

      <Heading size="md" mb={2}>
        Introduction
      </Heading>
      <Text mb={5}>
        Welcome to AQUARIZZ ("we", "our", "us"). FishKeeper Community is a
        social media platform with e-commerce capabilities focused on fish
        keeping enthusiasts. By accessing or using our website and services
        (collectively, the "Services"), you agree to comply with and be bound by
        these Terms of Service ("Terms"). If you do not agree to these Terms,
        please do not use our Services.
      </Text>

      <Heading size="md" mb={2}>
        Eligibility
      </Heading>
      <Text mb={5}>
        You must be at least 13 years old to use our Services. By using our
        Services, you represent and warrant that you have the right, authority,
        and capacity to enter into these Terms and to abide by all of the terms
        and conditions herein.
      </Text>

      <Heading size="md" mb={2}>
        Account Registration
      </Heading>
      <Text mb={5}>
        To access certain features of our Services, you may be required to
        create an account. You agree to provide accurate, current, and complete
        information during the registration process and to update such
        information to keep it accurate, current, and complete. You are
        responsible for safeguarding your password and for all activities that
        occur under your account.
      </Text>

      <Heading size="md" mb={3}>
        User Conduct
      </Heading>
      <Heading size="sm" mb={3}>
        You agree not to use our Services to:
      </Heading>
      <List spacing={3} mb={5}>
        <ListItem>
          Post any content that is unlawful, harmful, threatening, abusive,
          harassing, defamatory, vulgar, obscene, hateful, or racially,
          ethnically, or otherwise objectionable.{" "}
        </ListItem>
        <ListItem>Violate any applicable laws or regulations.</ListItem>
        <ListItem>
          Impersonate any person or entity or falsely state or otherwise
          misrepresent your affiliation with a person or entity.
        </ListItem>
        <ListItem>
          Engage in commercial activities without our prior written consent.
        </ListItem>
        <ListItem>
          Interfere with or disrupt the Services or servers or networks
          connected to the Services.
        </ListItem>
      </List>

      <Heading size="md" mb={2}>
        Your Content
      </Heading>
      <Text mb={5}>
        You retain ownership of the content you post on AQUARIZZ. By posting
        content, you grant us a non-exclusive, royalty-free, worldwide,
        sublicensable, and transferable license to use, reproduce, distribute,
        prepare derivative works of, display, and perform the content in
        connection with the Services and our business.
      </Text>

      <Heading size="md" mb={2}>
        Our Content
      </Heading>
      <Text mb={10}>
        The content provided through our Services, including text, graphics,
        logos, images, and software, is owned by or licensed to us and is
        protected by copyright, trademark, and other laws. You may not use,
        reproduce, distribute, or create derivative works of our content without
        our express written permission.
      </Text>

      <Heading size="lg" mb={5}>
        E commerce
      </Heading>
      <Heading size="sm" mb={2}>
        Transaction
      </Heading>
      <Text mb={5}>
        AQUARIZZ allows users to buy and sell fish keeping-related products. All
        transactions are subject to these Terms and any additional terms and
        conditions provided at the time of the transaction. We are not
        responsible for any transactions between users and do not guarantee the
        quality, safety, or legality of items sold.
      </Text>

      <Heading size="sm" mb={2}>
        Payments
      </Heading>
      <Text mb={5}>
        All payments for purchases made through our Services are processed
        through a third-party payment processor. By making a purchase, you agree
        to the third-party payment processor's terms and conditions.
      </Text>

      <Heading size="sm" mb={2}>
        Termination
      </Heading>
      <Text mb={5}>
        We may terminate or suspend your account and access to our Services at
        our sole discretion, without prior notice or liability, for any reason,
        including if you breach these Terms. Upon termination, your right to use
        our Services will immediately cease.
      </Text>

      <Heading size="sm" mb={2}>
        Disclaimer of Warranties
      </Heading>
      <Text mb={5}>
        Our Services are provided "as is" and "as available" without warranties
        of any kind, either express or implied. We do not warrant that our
        Services will be uninterrupted or error-free, nor do we make any
        warranty as to the results that may be obtained from the use of our
        Services.
      </Text>

      <Heading size="sm" mb={2}>
        Limitation of Liability
      </Heading>
      <Text mb={5}>
        To the fullest extent permitted by law, AQUARIZZ shall not be liable for
        any indirect, incidental, special, consequential, or punitive damages,
        or any loss of profits or revenues, whether incurred directly or
        indirectly, or any loss of data, use, goodwill, or other intangible
        losses, resulting from your use or inability to use the Services. any
        unauthorized access to or use of our servers and/or any personal
        information stored therein. any interruption or cessation of
        transmission to or from our Services. any bugs, viruses, trojan horses,
        or the like that may be transmitted to or through our Services by any
        third party. any errors or omissions in any content or for any loss or
        damage incurred as a result of the use of any content posted, emailed,
        transmitted, or otherwise made available through the Services and/or the
        defamatory, offensive, or illegal conduct of any third party.
      </Text>

      <Heading size="sm" mb={2}>
        Governing Law
      </Heading>
      <Text mb={5}>
        These Terms shall be governed and construed in accordance with the laws
        of the Philippines, without regard to its conflict of law provisions.
      </Text>

      <Heading size="sm" mb={2}>
        Changes to Terms
      </Heading>
      <Text mb={5}>
        We reserve the right, at our sole discretion, to modify or replace these
        Terms at any time. If a revision is material, we will provide at least
        30 days' notice prior to any new terms taking effect. What constitutes a
        material change will be determined at our sole discretion.
      </Text>

      <Heading size="sm" mb={2}>
        Contact Us
      </Heading>
      <Text mb={5}>
        If you have any questions about these Terms, please contact us at
        aquarizzcustomersupprt@gmail.com.
      </Text>

    </Box>
      <Footer />
    </Box>
  );
};

export default TermsOfService;
