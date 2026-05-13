import { useState } from 'react';
import { Box, VStack, Text, Flex, HStack, Image } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Layers, ClipboardList, History, Umbrella, LogOut, BarChart2, Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'डैशबोर्ड' },
  { to: '/officers', icon: Users, label: 'अधिकारी' },
  { to: '/status-overview', icon: BarChart2, label: 'स्थिति अवलोकन' },
  { to: '/designations', icon: Layers, label: 'पदनाम' },
  { to: '/duties', icon: ClipboardList, label: 'ड्यूटी प्रबंधन' },
  { to: '/duty-history', icon: History, label: 'ड्यूटी इतिहास' },
  { to: '/holidays', icon: Umbrella, label: 'छुट्टी प्रबंधन' },
  { to: '/settings', icon: Settings, label: 'सेटिंग्स' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
    <Box
      w="230px"
      bg="#090884"
      h="calc(100vh - 50px)"
      position="fixed"
      left="0"
      top="50px"
      display="flex"
      flexDirection="column"
      zIndex="999"
      boxShadow="2px 0 10px rgba(0,0,0,0.15)"
      transform={{
        base: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        md: 'translateX(0)',
      }}
      transition="transform 0.3s ease"
    >
      {/* Logo Section */}
      <Flex
        px={4}
        py={3}
        alignItems="center"
        justifyContent="center"
        bg="rgba(0,0,0,0.2)"
        borderBottom="1px solid rgba(255,255,255,0.15)"
      >
        <Box
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            position="absolute"
            w="64px" h="64px"
            borderRadius="full"
            bg="linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)"
            opacity="0.3"
            filter="blur(8px)"
          />
          <Box
            position="relative"
            w="56px" h="56px"
            borderRadius="full"
            bg="linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)"
            p="3px"
            flexShrink={0}
          >
            <Box
              w="full" h="full"
              borderRadius="full"
              bg="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              p={1}
            >
              <Image
                src="/logo.png"
                alt="Logo"
                w="full" h="full"
                objectFit="contain"
              />
            </Box>
          </Box>
        </Box>
      </Flex>

      {/* Nav Items */}
      <VStack spacing={0} align="stretch" flex="1" mt={1} overflowY="auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }} onClick={handleNavClick}>
            {({ isActive }) => (
              <HStack
                w="full" px={4} py={3} cursor="pointer"
                bg={isActive ? 'white' : 'transparent'}
                color={isActive ? '#090884' : 'white'}
                borderLeft={isActive ? '4px solid #fe0808' : '4px solid transparent'}
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                transition="0.2s"
              >
                <Icon size={17} />
                <Text fontSize="13px" fontWeight={isActive ? '600' : '400'}>{label}</Text>
              </HStack>
            )}
          </NavLink>
        ))}
      </VStack>

      {/* Logout */}
      <Box borderTop="2px solid white" p={2} bg="#fe0808">
        <HStack
          px={4} py={3} cursor="pointer" color="white"
          _hover={{ bg: '#d10606', color: 'white' }}
          borderRadius="sm" transition="0.2s"
          onClick={() => setShowConfirm(true)}
        >
          <LogOut size={17} />
          <Text fontSize="13px">लॉगआउट</Text>
        </HStack>
      </Box>
    </Box>

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

export default Sidebar;
export { NAV_ITEMS };
