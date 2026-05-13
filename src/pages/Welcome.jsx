import { useNavigate } from 'react-router-dom';
import { Box, Flex, Text, Button, VStack, Image } from '@chakra-ui/react';
import { ArrowRight } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <Flex
      minH="100vh"
      bg="#090884"
      position="relative"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        inset="0"
        opacity="0.03"
        backgroundImage="radial-gradient(circle, white 1px, transparent 1px)"
        backgroundSize="40px 40px"
      />

      {/* Top Accent Bar */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        h="3px"
        bg="white"
      />

      {/* Main Content */}
      <VStack
        gap={{ base: 6, md: 8 }}
        maxW="600px"
        w="full"
        px={4}
        position="relative"
        zIndex="1"
      >
        {/* Logo */}
        <Box
          className="welcome-logo"
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Golden Outer Glow */}
          <Box
            position="absolute"
            w={{ base: '180px', md: '220px' }}
            h={{ base: '180px', md: '220px' }}
            borderRadius="full"
            bg="linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)"
            opacity="0.3"
            filter="blur(20px)"
            animation="pulse 3s ease-in-out infinite"
          />
          {/* Golden Circle Border */}
          <Box
            position="relative"
            w={{ base: '160px', md: '190px' }}
            h={{ base: '160px', md: '190px' }}
            borderRadius="full"
            bg="linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)"
            p="4px"
          >
            {/* White Inner Circle */}
            <Box
              w="full"
              h="full"
              borderRadius="full"
              bg="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              p={{ base: 4, md: 5 }}
              overflow="hidden"
            >
              <Image
                src="/logo.png"
                alt="UP Police Logo"
                w="full"
                h="full"
                objectFit="contain"
              />
            </Box>
          </Box>
        </Box>

        {/* Title */}
        <VStack gap={3} textAlign="center">
          <Text
            className="welcome-subtitle"
            color="white"
            fontSize={{ base: '13px', md: '15px' }}
            fontWeight="700"
            letterSpacing="4px"
            textTransform="uppercase"
          >
            उत्तर प्रदेश पुलिस विभाग
          </Text>
          <Text
            className="welcome-title"
            color="white"
            fontSize={{ base: '32px', md: '42px' }}
            fontWeight="800"
            lineHeight="1.1"
            textShadow="0 4px 20px rgba(0,0,0,0.4)"
          >
            पुलिस लाइन प्रबंधन प्रणाली
          </Text>
          <Text
            className="welcome-tagline"
            color="rgba(255,255,255,0.8)"
            fontSize={{ base: '15px', md: '18px' }}
            fontWeight="500"
          >
            Police Line Duty Management System
          </Text>
        </VStack>

        {/* CTA Button */}
        <Button
          className="welcome-btn"
          size="lg"
          bg="#fe0808"
          color="white"
          _hover={{ bg: '#d10606', transform: 'scale(1.05)' }}
          _active={{ transform: 'scale(0.98)' }}
          onClick={() => navigate('/login')}
          h={{ base: '56px', md: '64px' }}
          px={{ base: 10, md: 14 }}
          fontSize={{ base: '17px', md: '20px' }}
          fontWeight="700"
          borderRadius="12px"
          boxShadow="0 10px 30px rgba(254, 8, 8, 0.5)"
          transition="all 0.3s ease"
          rightIcon={<ArrowRight size={24} />}
          mt={2}
        >
          प्रवेश करें
        </Button>

        {/* Footer */}
        <VStack className="welcome-footer" gap={1} mt={6}>
          <Text
            color="rgba(255,255,255,0.5)"
            fontSize={{ base: '11px', md: '12px' }}
            textAlign="center"
          >
            © {new Date().getFullYear()} उत्तर प्रदेश पुलिस विभाग
          </Text>
          <Text
            color="rgba(255,255,255,0.6)"
            fontSize={{ base: '10px', md: '11px' }}
            fontWeight="600"
          >
            Crafted with ❤️ by <a href="https://digicoders.in" target="_blank" rel="noopener noreferrer"><span style={{color:"red"}}>Team Digicoders</span></a>
          </Text>
        </VStack>
      </VStack>

      {/* Bottom Accent Bar */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        h="3px"
        bg="white"
      />
    </Flex>
  );
};

export default Welcome;


