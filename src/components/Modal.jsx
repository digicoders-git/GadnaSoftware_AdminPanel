import { Box, Flex, Text, IconButton, Portal } from '@chakra-ui/react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <Box
        position="fixed" inset="0" bg="blackAlpha.600" zIndex="1300"
        display="flex" alignItems="center" justifyContent="center" p={4}
        onClick={onClose}
      >
        <Box
          bg="white" borderRadius="sm" boxShadow="2xl"
          w={{ base: 'full', sm: '500px' }} maxH="90vh" overflowY="auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Flex
            justifyContent="space-between" alignItems="center"
            px={5} py={4} borderBottom="1px solid" borderColor="gray.200"
            bg="#090884" borderTopRadius="sm"
          >
            <Text fontSize="16px" fontWeight="600" color="white">{title}</Text>
            <IconButton
              size="sm" variant="ghost" color="white" _hover={{ bg: 'rgba(255,255,255,0.2)' }}
              onClick={onClose} aria-label="बंद करें"
            >
              <X size={18} />
            </IconButton>
          </Flex>
          <Box p={5}>{children}</Box>
        </Box>
      </Box>
    </Portal>
  );
};

export default Modal;


