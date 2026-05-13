import { Box, useDisclosure } from '@chakra-ui/react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const Layout = ({ children }) => {
  const { open, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh">
      <Header onOpen={onOpen} onClose={onClose} isOpen={open} />

      {/* Mobile Overlay */}
      {open && (
        <Box
          display={{ base: 'block', md: 'none' }}
          position="fixed"
          inset="0"
          bg="blackAlpha.600"
          zIndex="998"
          top="50px"
          onClick={onClose}
        />
      )}

      {/* Sidebar - desktop fixed, mobile slide */}
      <Sidebar isOpen={open} onClose={onClose} />

      <Box
        ml={{ base: 0, md: '230px' }}
        p={{ base: 4, md: 6 }}
        transition="margin 0.3s ease"
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
