import { useState } from 'react';
import { Flex, IconButton, HStack, Text, Box } from '@chakra-ui/react';
import { Menu, Bell, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';

const Header = ({ onOpen, onClose, isOpen }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
    <Flex
      px={4}
      height="50px"
      alignItems="center"
      bg="#090884"
      color="white"
      justifyContent="space-between"
      position="sticky"
      top="0"
      zIndex="1000"
      boxShadow="0 2px 8px rgba(0,0,0,0.1)"
      borderBottom="2px solid white"
    >
      <Flex alignItems="center" gap={2}>
        {/* Mobile Menu Button */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          variant="ghost" color="white" _hover={{ bg: 'rgba(255,255,255,0.1)' }}
          onClick={isOpen ? onClose : onOpen} aria-label="मेनू"
        >
          <Menu size={22} />
        </IconButton>

        <HStack
          spacing={2} mr={8}
          display={{ base: 'none', md: 'flex' }}
          width="230px"
        >
          <Shield size={20} color="white" />
          <Text fontSize="16px" fontWeight="700" letterSpacing="0.5px">
            पुलिस लाइन
          </Text>
        </HStack>
      </Flex>

      <HStack spacing={3}>
        <Box display={{ base: 'none', sm: 'block' }} textAlign="right">
          <Text fontSize="13px" fontWeight="600">{admin?.name}</Text>
          <Text fontSize="11px" color="white" fontWeight="500">
            {admin?.role === 'superadmin' ? 'सुपर एडमिन' : 'एडमिन'}
          </Text>
        </Box>
        <IconButton
          variant="ghost" color="white" _hover={{ bg: '#fe0808' }}
          onClick={() => setShowConfirm(true)} aria-label="लॉगआउट" title="लॉगआउट"
        >
          <LogOut size={18} />
        </IconButton>
      </HStack>
    </Flex>

    <ConfirmDialog
      isOpen={showConfirm}
      onClose={() => setShowConfirm(false)}
      onConfirm={handleLogout}
      type="warning"
      title="लॉगआउट करें?"
      message="क्या आप सच में लॉगआउट करना चाहते हैं?"
      confirmText="हाँ, लॉगआउट"
      cancelText="नहीं, रहने दें"
    />
    </>
  );
};

export default Header;


