import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Text, Input, Button, VStack, Image, HStack } from '@chakra-ui/react';
import { Lock, Mail, ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginAdmin } from '../api/services';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier.trim()) { toast.error('कृपया ईमेल या मोबाइल नंबर दर्ज करें'); return; }
    if (!form.password) { toast.error('कृपया पासवर्ड दर्ज करें'); return; }
    setLoading(true);
    try {
      const { data } = await loginAdmin(form);
      login(data);
      toast.success('✅ स्वागत है ' + data.name + '!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ लॉगिन विफल हुआ। कृपया क्रेडेंशियल्स जांचें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" bg="#f0f2f5">

      {/* ── Left Panel (Desktop only) ── */}
      <Flex
        display={{ base: 'none', lg: 'flex' }}
        w="50%" bg="#090884" direction="column"
        alignItems="center" justifyContent="center"
        position="relative" overflow="hidden" px={12}
      >
        <Box position="absolute" inset="0" opacity="0.04"
          backgroundImage="radial-gradient(circle, white 1px, transparent 1px)"
          backgroundSize="36px 36px" />
        <Box position="absolute" top="0" left="0" right="0" h="4px"
          bg="linear-gradient(90deg, #FFD700, #FFA500, #FFD700)" />
        <Box position="absolute" bottom="0" left="0" right="0" h="4px"
          bg="linear-gradient(90deg, #FFD700, #FFA500, #FFD700)" />
        <Box position="absolute" top="-80px" right="-80px" w="300px" h="300px"
          borderRadius="full" bg="rgba(255,255,255,0.03)" />
        <Box position="absolute" bottom="-60px" left="-60px" w="250px" h="250px"
          borderRadius="full" bg="rgba(255,255,255,0.03)" />

        <VStack gap={8} position="relative" zIndex={1} textAlign="center">
          <Box position="relative" display="flex" alignItems="center" justifyContent="center"
            className="login-logo">
            <Box position="absolute" w="220px" h="220px" borderRadius="full"
              bg="linear-gradient(135deg, #FFD700, #FFA500)"
              opacity="0.2" filter="blur(25px)" />
            <Box position="relative" w="190px" h="190px" borderRadius="full"
              bg="linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)" p="4px">
              <Box w="full" h="full" borderRadius="full" bg="white"
                display="flex" alignItems="center" justifyContent="center"
                p={4} overflow="hidden">
                <Image src="/logo.png" alt="UP Police Logo" w="full" h="full" objectFit="contain" />
              </Box>
            </Box>
          </Box>

          <VStack gap={3} className="login-text">
            <Text color="rgba(255,215,0,0.9)" fontSize="12px" fontWeight="700"
              letterSpacing="5px" textTransform="uppercase">
              उत्तर प्रदेश पुलिस विभाग
            </Text>
            <Text color="white" fontSize="32px" fontWeight="800" lineHeight="1.2"
              textShadow="0 4px 20px rgba(0,0,0,0.3)">
              पुलिस लाइन<br />प्रबंधन प्रणाली
            </Text>
            <Text color="rgba(255,255,255,0.6)" fontSize="15px">
              Police Line Duty Management System
            </Text>
          </VStack>

          <VStack gap={2} className="login-badges">
            {[
              '🛡️ सुरक्षित एवं विश्वसनीय प्रणाली',
              '📋 ड्यूटी प्रबंधन एवं असाइनमेंट',
              '📊 रियल-टाइम स्थिति अवलोकन',
            ].map((f, i) => (
              <Box key={i} bg="rgba(255,255,255,0.08)" px={4} py={2}
                borderRadius="full" border="1px solid rgba(255,255,255,0.12)">
                <Text color="rgba(255,255,255,0.8)" fontSize="13px">{f}</Text>
              </Box>
            ))}
          </VStack>
        </VStack>

        <HStack position="absolute" bottom={5} gap={3} className="login-footer-left">
          <HStack gap={2} cursor="pointer" onClick={() => navigate('/')}
            color="rgba(255,255,255,0.4)" _hover={{ color: 'rgba(255,255,255,0.8)' }} transition="0.2s">
            <ArrowLeft size={13} />
            <Text fontSize="12px">वापस जाएं</Text>
          </HStack>
          <Text color="rgba(255,255,255,0.2)" fontSize="12px">|</Text>
          <Text color="rgba(255,255,255,0.3)" fontSize="11px">
            © {new Date().getFullYear()} crafted with ❤️ by <a href="https://digicoders.in" target="_blank" rel="noopener noreferrer" style={{color: "red", textDecoration: "none", fontWeight: "bold"}}> Team Digicoders</a>
          </Text>
        </HStack>
      </Flex>

      {/* ── Right Panel / Mobile Full Screen ── */}
      <Flex
        w={{ base: '100%', lg: '50%' }}
        direction="column"
        minH="100vh"
        bg={{ base: '#090884', lg: 'white' }}
      >

        {/* Mobile Top Header */}
        <Box display={{ base: 'block', lg: 'none' }}>
          {/* Back button row */}
          <Flex px={5} pt={5} pb={2} alignItems="center">
            <HStack gap={2} cursor="pointer" onClick={() => navigate('/')}
              color="rgba(255,255,255,0.7)" _hover={{ color: 'white' }} transition="0.2s">
              <ArrowLeft size={16} />
              <Text fontSize="13px" fontWeight="500">वापस</Text>
            </HStack>
          </Flex>

          {/* Mobile Logo + Title */}
          <Flex direction="column" alignItems="center" py={6} gap={4}>
            <Box position="relative" display="flex" alignItems="center" justifyContent="center">
              <Box position="absolute" w="110px" h="110px" borderRadius="full"
                bg="linear-gradient(135deg, #FFD700, #FFA500)"
                opacity="0.2" filter="blur(15px)" />
              <Box position="relative" w="100px" h="100px" borderRadius="full"
                bg="linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)" p="3px">
                <Box w="full" h="full" borderRadius="full" bg="white"
                  display="flex" alignItems="center" justifyContent="center"
                  p={2} overflow="hidden">
                  <Image src="/logo.png" alt="Logo" w="full" h="full" objectFit="contain" />
                </Box>
              </Box>
            </Box>
            <VStack gap={1} textAlign="center">
              <Text color="rgba(255,215,0,0.9)" fontSize="11px" fontWeight="700"
                letterSpacing="4px" textTransform="uppercase">
                उत्तर प्रदेश पुलिस विभाग
              </Text>
              <Text color="white" fontSize="22px" fontWeight="800" lineHeight="1.2">
                पुलिस लाइन प्रबंधन
              </Text>
              <Text color="rgba(255,255,255,0.5)" fontSize="12px">
                Police Line Duty Management System
              </Text>
            </VStack>
          </Flex>
        </Box>

        {/* Form Card */}
        <Flex
          flex={1}
          bg="white"
          borderRadius={{ base: '28px 28px 0 0', lg: '0' }}
          direction="column"
          alignItems="center"
          justifyContent={{ base: 'flex-start', lg: 'center' }}
          px={{ base: 6, sm: 8, lg: 14 }}
          pt={{ base: 8, lg: 0 }}
          pb={{ base: 10, lg: 0 }}
          position="relative"
        >
          {/* Desktop back button */}
          <Box display={{ base: 'none', lg: 'block' }} position="absolute" top={5} left={5}>
            <HStack gap={2} cursor="pointer" onClick={() => navigate('/')}
              color="gray.400" _hover={{ color: '#090884' }} transition="0.2s"
              bg="gray.50" px={3} py={2} borderRadius="8px"
              border="1px solid" borderColor="gray.200">
              <ArrowLeft size={15} />
              <Text fontSize="13px" fontWeight="500">वापस</Text>
            </HStack>
          </Box>

          <Box w="full" maxW="420px" className="login-form">
            {/* Heading */}
            <VStack align="flex-start" gap={1} mb={7}>
              <HStack gap={2}>
                <Box bg="#090884" p={1.5} borderRadius="6px">
                  <Shield size={18} color="white" />
                </Box>
                <Text fontSize={{ base: '22px', lg: '26px' }} fontWeight="800" color="gray.800">
                  लॉगिन करें
                </Text>
              </HStack>
              <Text fontSize="13px" color="gray.500" pl={1}>
                अपने एडमिन खाते में प्रवेश करें
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                {/* Email / Phone */}
                <Box w="full">
                  <Text fontSize="13px" color="gray.600" mb={2} fontWeight="600">ईमेल या मोबाइल नंबर</Text>
                  <Flex border="1.5px solid" borderColor="gray.200" borderRadius="12px"
                    alignItems="center" px={4} bg="gray.50" h="52px"
                    _focusWithin={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)' }}
                    transition="all 0.2s">
                    <Mail size={17} color="#090884" style={{ flexShrink: 0 }} />
                    <Input border="none" bg="transparent"
                      _focus={{ boxShadow: 'none', outline: 'none' }}
                      placeholder="ईमेल या 10-अंकीय मोबाइल"
                      value={form.identifier}
                      onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                      type="text" required fontSize="14px" pl={3} />
                  </Flex>
                </Box>

                {/* Password */}
                <Box w="full">
                  <Text fontSize="13px" color="gray.600" mb={2} fontWeight="600">पासवर्ड</Text>
                  <Flex border="1.5px solid" borderColor="gray.200" borderRadius="12px"
                    alignItems="center" px={4} bg="gray.50" h="52px"
                    _focusWithin={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)' }}
                    transition="all 0.2s">
                    <Lock size={17} color="#090884" style={{ flexShrink: 0 }} />
                    <Input border="none" bg="transparent"
                      _focus={{ boxShadow: 'none', outline: 'none' }}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      type={showPass ? 'text' : 'password'} required fontSize="14px" pl={3} />
                    <Box cursor="pointer" onClick={() => setShowPass(!showPass)}
                      color="gray.400" _hover={{ color: '#090884' }} transition="0.2s" flexShrink={0}>
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </Box>
                  </Flex>
                </Box>

                {/* Submit */}
                <Button
                  type="submit" w="full" h="54px"
                  bg="#090884" color="white"
                  _hover={{ bg: '#06066e', transform: 'translateY(-1px)', boxShadow: '0 8px 25px rgba(9,8,132,0.35)' }}
                  _active={{ transform: 'translateY(0)' }}
                  loading={loading} loadingText="प्रवेश हो रहा है..."
                  fontSize="16px" fontWeight="700" borderRadius="12px"
                  transition="all 0.2s" mt={1}
                  boxShadow="0 4px 15px rgba(9,8,132,0.25)">
                  प्रवेश करें →
                </Button>
              </VStack>
            </form>

            {/* Security note */}
            <Box mt={6} p={4} bg="gray.50" borderRadius="12px"
              border="1px solid" borderColor="gray.100">
              <HStack gap={2} mb={1}>
                <Box w="6px" h="6px" borderRadius="full" bg="#090884" />
                <Text fontSize="12px" fontWeight="600" color="gray.600">सुरक्षित लॉगिन</Text>
              </HStack>
              <Text fontSize="12px" color="gray.400">
                यह प्रणाली केवल अधिकृत एडमिन के लिए है। अनधिकृत प्रवेश वर्जित है।
              </Text>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Login;
