import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, Input, VStack, HStack, Badge, Spinner,
} from '@chakra-ui/react';
import {
  Settings as SettingsIcon, User, Lock, Mail, Shield,
  Pencil, KeyRound, Eye, EyeOff, CheckCircle, Calendar, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyProfile, updateMyProfile, changeMyPassword } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';

const Settings = () => {
  const { updateAdminData } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPass, setSavingPass] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMyProfile();
        setProfile(data);
        setProfileForm({ name: data.name, email: data.email });
      } catch {
        toast.error('प्रोफ़ाइल लोड करने में समस्या हुई');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { toast.error('नाम दर्ज करें'); return; }
    if (!profileForm.email.trim()) { toast.error('ईमेल दर्ज करें'); return; }
    setSavingProfile(true);
    try {
      const { data } = await updateMyProfile(profileForm);
      setProfile((p) => ({ ...p, ...data }));
      updateAdminData(data);
      setEditingProfile(false);
      toast.success('प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई');
    } catch (err) {
      toast.error(err.response?.data?.message || 'अपडेट करने में समस्या हुई');
    } finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      toast.error('सभी फ़ील्ड भरें'); return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('नया पासवर्ड कम से कम 6 अक्षर का होना चाहिए'); return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते'); return;
    }
    setSavingPass(true);
    try {
      await changeMyPassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('पासवर्ड सफलतापूर्वक बदल दिया गया');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'पासवर्ड बदलने में समस्या हुई');
    } finally { setSavingPass(false); }
  };

  if (loading) return (
    <Flex h="60vh" alignItems="center" justifyContent="center">
      <VStack><Spinner size="xl" color="#090884" /><Text color="gray.500">लोड हो रहा है...</Text></VStack>
    </Flex>
  );

  return (
    <Box>
      <PageHeader title="सेटिंग्स" subtitle="अपनी प्रोफ़ाइल और पासवर्ड प्रबंधित करें" icon={SettingsIcon} />

      <VStack gap={4} align="stretch">

        {/* ── Profile Card ── */}
        <Box bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
          {/* Blue Header */}
          <Flex bg="#090884" px={4} py={3} justifyContent="space-between" alignItems="center">
            <HStack gap={2}>
              <User size={16} color="white" />
              <Text color="white" fontWeight="600" fontSize="14px">प्रोफ़ाइल जानकारी</Text>
            </HStack>
            {!editingProfile && (
              <Button size="xs" bg="rgba(255,255,255,0.2)" color="white"
                _hover={{ bg: 'rgba(255,255,255,0.3)' }}
                onClick={() => setEditingProfile(true)}
                borderRadius="4px" fontSize="12px" px={3}>
                <Pencil size={11} style={{ marginRight: 4 }} /> एडिट करें
              </Button>
            )}
          </Flex>

          {/* Avatar Row */}
          <Flex px={4} py={4} alignItems="center" gap={4} borderBottom="1px solid" borderColor="gray.100">
            <Flex w="60px" h="60px" borderRadius="full" bg="#090884"
              alignItems="center" justifyContent="center" flexShrink={0}
              boxShadow="0 0 0 3px #eeeeff">
              <Text color="white" fontSize="24px" fontWeight="700">
                {profile?.name?.charAt(0)?.toUpperCase()}
              </Text>
            </Flex>
            <Box minW={0}>
              <Text fontSize="16px" fontWeight="700" color="gray.800" noOfLines={1}>{profile?.name}</Text>
              <Text fontSize="12px" color="gray.500" noOfLines={1}>{profile?.email}</Text>
              <HStack gap={2} mt={1} flexWrap="wrap">
                <Badge
                  bg={profile?.role === 'superadmin' ? '#fff3cd' : '#eeeeff'}
                  color={profile?.role === 'superadmin' ? '#856404' : '#090884'}
                  px={2} py={0.5} borderRadius="full" fontSize="11px">
                  {profile?.role === 'superadmin' ? '★ Super Admin' : 'Admin'}
                </Badge>
                <Badge
                  bg={profile?.isActive ? '#dcfce7' : '#ffe5e5'}
                  color={profile?.isActive ? '#166534' : '#fe0808'}
                  px={2} py={0.5} borderRadius="full" fontSize="11px">
                  {profile?.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                </Badge>
              </HStack>
            </Box>
          </Flex>

          {/* Info Rows — show when not editing */}
          {!editingProfile && (
            <Box px={4} py={3}>
              <VStack align="stretch" gap={2}>
                <Flex justifyContent="space-between" alignItems="center">
                  <HStack gap={2} color="gray.500"><User size={13} /><Text fontSize="12px">पूरा नाम</Text></HStack>
                  <Text fontSize="13px" fontWeight="600" color="gray.700">{profile?.name}</Text>
                </Flex>
                <Box h="1px" bg="gray.100" />
                <Flex justifyContent="space-between" alignItems="center">
                  <HStack gap={2} color="gray.500"><Mail size={13} /><Text fontSize="12px">ईमेल</Text></HStack>
                  <Text fontSize="13px" color="gray.700">{profile?.email}</Text>
                </Flex>
                <Box h="1px" bg="gray.100" />
                <Flex justifyContent="space-between" alignItems="center">
                  <HStack gap={2} color="gray.500"><Shield size={13} /><Text fontSize="12px">भूमिका</Text></HStack>
                  <Text fontSize="13px" color="gray.700">{profile?.role === 'superadmin' ? 'Super Admin' : 'Admin'}</Text>
                </Flex>
                <Box h="1px" bg="gray.100" />
                <Flex justifyContent="space-between" alignItems="center">
                  <HStack gap={2} color="gray.500"><Calendar size={13} /><Text fontSize="12px">जोड़ा गया</Text></HStack>
                  <Text fontSize="13px" color="gray.700">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('hi-IN') : '—'}
                  </Text>
                </Flex>
              </VStack>
            </Box>
          )}

          {/* Edit Form — show when editing */}
          {editingProfile && (
            <Box px={4} py={4}>
              <form onSubmit={handleProfileSave}>
                <VStack gap={4}>
                  <FF label="पूरा नाम *">
                    <Input value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="जैसे: रमेश कुमार" fontSize="14px" required
                      h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                      bg="gray.50" px={4}
                      _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                      transition="all 0.2s" />
                  </FF>
                  <FF label="ईमेल *">
                    <Input type="email" value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="जैसे: admin@example.com" fontSize="14px" required
                      h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                      bg="gray.50" px={4}
                      _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                      transition="all 0.2s" />
                  </FF>
                  <Flex gap={3} w="full" pt={1}
                    flexDirection={{ base: 'column', sm: 'row' }}
                    justifyContent={{ base: 'stretch', sm: 'flex-end' }}>
                    <Button onClick={() => setEditingProfile(false)}
                      fontSize="14px" w={{ base: 'full', sm: 'auto' }} h="40px"
                      borderRadius="6px" px={5}
                      bg="gray.100" color="gray.700" _hover={{ bg: 'gray.200' }}>
                      <X size={14} style={{ marginRight: 5 }} /> डिलीट करें
                    </Button>
                    <Button type="submit" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                      loading={savingProfile} loadingText="सहेजा जा रहा है..."
                      fontSize="14px" w={{ base: 'full', sm: 'auto' }} h="40px"
                      borderRadius="6px" px={5}>
                      <CheckCircle size={14} style={{ marginRight: 5 }} /> अपडेट करें
                    </Button>
                  </Flex>
                </VStack>
              </form>
            </Box>
          )}
        </Box>

        {/* ── Password Card ── */}
        <Box bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
          <Flex bg="#090884" px={4} py={3} alignItems="center" gap={2}>
            <Lock size={16} color="white" />
            <Text color="white" fontWeight="600" fontSize="14px">पासवर्ड बदलें</Text>
          </Flex>

          <Box px={4} py={4}>
            {/* Security Tips */}
            <Box bg="#eeeeff" borderRadius="sm" p={3} mb={4} borderLeft="3px solid #090884">
              <HStack gap={2} mb={1}>
                <KeyRound size={13} color="#090884" />
                <Text fontSize="13px" fontWeight="600" color="#090884">सुरक्षा सुझाव</Text>
              </HStack>
              <VStack align="stretch" gap={0.5}>
                {[
                  'कम से कम 6 अक्षर का पासवर्ड रखें',
                  'अक्षर, अंक और चिह्न मिलाएं',
                  'पासवर्ड किसी से साझा न करें',
                ].map((tip) => (
                  <Text key={tip} fontSize="12px" color="#090884">• {tip}</Text>
                ))}
              </VStack>
            </Box>

            <form onSubmit={handlePasswordChange}>
              <VStack gap={4}>
                <FF label="वर्तमान पासवर्ड *">
                  <PasswordInput
                    value={passForm.currentPassword}
                    onChange={(v) => setPassForm({ ...passForm, currentPassword: v })}
                    show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)}
                    placeholder="वर्तमान पासवर्ड दर्ज करें"
                  />
                </FF>
                <FF label="नया पासवर्ड *">
                  <PasswordInput
                    value={passForm.newPassword}
                    onChange={(v) => setPassForm({ ...passForm, newPassword: v })}
                    show={showNew} onToggle={() => setShowNew(!showNew)}
                    placeholder="नया पासवर्ड दर्ज करें"
                  />
                  {passForm.newPassword && <StrengthBar password={passForm.newPassword} />}
                </FF>
                <FF label="पासवर्ड की पुष्टि करें *">
                  <PasswordInput
                    value={passForm.confirmPassword}
                    onChange={(v) => setPassForm({ ...passForm, confirmPassword: v })}
                    show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)}
                    placeholder="पासवर्ड दोबारा दर्ज करें"
                  />
                  {passForm.confirmPassword && passForm.newPassword && (
                    <Text fontSize="12px" mt={1}
                      color={passForm.newPassword === passForm.confirmPassword ? '#166534' : '#fe0808'}>
                      {passForm.newPassword === passForm.confirmPassword
                        ? '✓ पासवर्ड मेल खाते हैं'
                        : '✗ पासवर्ड मेल नहीं खाते'}
                    </Text>
                  )}
                </FF>
                <Button type="submit" w="full" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                  loading={savingPass} loadingText="बदला जा रहा है..."
                  fontSize="14px" h="40px" borderRadius="6px">
                  <Lock size={14} style={{ marginRight: 6 }} /> पासवर्ड बदलें
                </Button>
              </VStack>
            </form>
          </Box>
        </Box>

      </VStack>
    </Box>
  );
};

const PasswordInput = ({ value, onChange, show, onToggle, placeholder }) => (
  <Flex border="1.5px solid" borderColor="gray.200" borderRadius="8px" alignItems="center"
    bg="gray.50" h="48px" px={4}
    _focusWithin={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)' }}
    transition="all 0.2s">
    <Input
      type={show ? 'text' : 'password'}
      value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} fontSize="14px" border="none" bg="transparent"
      _focus={{ boxShadow: 'none', outline: 'none' }} required pl={0}
    />
    <Box cursor="pointer" color="gray.400" _hover={{ color: '#090884' }}
      onClick={onToggle} flexShrink={0} ml={2}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </Box>
  </Flex>
);

const StrengthBar = ({ password }) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['', 'बहुत कमज़ोर', 'कमज़ोर', 'ठीक है', 'मज़बूत', 'बहुत मज़बूत'];
  const colors = ['', '#fe0808', '#fe0808', '#856404', '#090884', '#166534'];
  return (
    <Box mt={2}>
      <Flex gap={1} mb={1}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={i} flex={1} h="3px" borderRadius="full"
            bg={i <= score ? colors[score] : '#e2e8f0'} transition="background 0.3s" />
        ))}
      </Flex>
      <Text fontSize="11px" color={colors[score]}>{labels[score]}</Text>
    </Box>
  );
};

const FF = ({ label, children }) => (
  <Box w="full">
    <Text fontSize="13px" color="gray.600" mb={1} fontWeight="500">{label}</Text>
    {children}
  </Box>
);

export default Settings;
