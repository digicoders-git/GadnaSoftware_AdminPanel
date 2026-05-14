import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, Input, VStack, HStack, Badge, SimpleGrid, Spinner,
} from '@chakra-ui/react';
import { UserCheck, Search, ArrowLeft, Phone, Hash, Award, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getUserStatusOverview, getDuties, assignDuty } from '../../api/services';
import Modal from '../../components/Modal';

const AvailableOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assignModal, setAssignModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [pendingDuties, setPendingDuties] = useState([]);
  const [assignForm, setAssignForm] = useState({ dutyId: '', dutyType: 'patrol', startDate: '', endDate: '', remarks: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const { data } = await getUserStatusOverview();
      setOfficers(data.available || []);
    } catch { toast.error('डेटा लोड करने में समस्या हुई'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAssign = async (officer) => {
    setSelectedOfficer(officer);
    setAssignForm({ dutyId: '', dutyType: 'patrol', startDate: '', endDate: '', remarks: '' });
    try {
      const { data } = await getDuties();
      setPendingDuties(data.filter(d => d.status === 'pending' || d.status === 'active'));
    } catch { toast.error('ड्यूटी सूची लोड नहीं हुई'); }
    setAssignModal(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.dutyId) { toast.error('कृपया ड्यूटी चुनें'); return; }
    if (!assignForm.dutyType) { toast.error('कृपया ड्यूटी प्रकार चुनें'); return; }
    if (!assignForm.startDate) { toast.error('कृपया शुरू तारीख चुनें'); return; }
    setSaving(true);
    try {
      await assignDuty(assignForm.dutyId, {
        userId: selectedOfficer._id,
        dutyType: assignForm.dutyType,
        startDate: assignForm.startDate,
        endDate: assignForm.endDate || undefined,
        remarks: assignForm.remarks,
      });
      toast.success(`${selectedOfficer.name} को ड्यूटी सफलतापूर्वक असाइन की गई`);
      setAssignModal(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'असाइन करने में समस्या हुई'); }
    finally { setSaving(false); }
  };

  const filtered = officers.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.pnoNumber?.toLowerCase().includes(search.toLowerCase()) ||
    u.phoneNumber?.includes(search)
  );

  if (loading) return <Loader />;

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={5}
        bg="white" p={4} borderRadius="sm" boxShadow="sm" flexWrap="wrap" gap={2}
        borderLeft="4px solid #090884">
        <HStack gap={3}>
          <Box bg="#090884" p={2} borderRadius="sm"><UserCheck size={20} color="white" /></Box>
          <Box>
            <Text fontSize={{ base: '16px', md: '20px' }} fontWeight="700" color="gray.700">उपलब्ध अधिकारी</Text>
            <Text fontSize="12px" color="gray.500">ड्यूटी असाइन करने के लिए तैयार अधिकारी</Text>
          </Box>
        </HStack>
        <HStack gap={2} cursor="pointer" onClick={() => navigate('/dashboard')}
          color="gray.400" _hover={{ color: '#090884' }} transition="0.2s">
          <ArrowLeft size={15} />
          <Text fontSize="12px">डैशबोर्ड</Text>
        </HStack>
      </Flex>

      <Flex mb={4}>
        <Flex border="1px solid" borderColor="gray.300" borderRadius="4px"
          alignItems="center" px={3} bg="white" w={{ base: 'full', sm: '300px' }}>
          <Search size={15} color="#999" />
          <Input border="none" _focus={{ boxShadow: 'none' }} placeholder="नाम, PNO या फोन खोजें..."
            value={search} onChange={(e) => setSearch(e.target.value)} fontSize="14px" h="38px" />
        </Flex>
      </Flex>

      {filtered.length === 0 ? (
        <Box bg="white" borderRadius="sm" p={10} textAlign="center" boxShadow="sm">
          <UserCheck size={32} color="#ccc" style={{ margin: '0 auto 8px' }} />
          <Text color="gray.500" fontWeight="600">कोई उपलब्ध अधिकारी नहीं</Text>
          <Text color="gray.400" fontSize="13px">सभी अधिकारी ड्यूटी या छुट्टी पर हैं</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
          {filtered.map((u, i) => (
            <Box key={u._id} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden"
              borderLeft="4px solid #090884">
              <Flex bg="#090884" px={4} py={3} justifyContent="space-between" alignItems="center">
                <HStack gap={2}>
                  <Box bg="rgba(255,255,255,0.2)" borderRadius="full" w="26px" h="26px"
                    display="flex" alignItems="center" justifyContent="center">
                    <Text color="white" fontSize="11px" fontWeight="700">{i + 1}</Text>
                  </Box>
                  <Text color="white" fontSize="14px" fontWeight="700" noOfLines={1}>{u.name}</Text>
                </HStack>
                <Badge bg="#eeeeff" color="#090884" px={2} py={0.5} borderRadius="full" fontSize="10px">उपलब्ध</Badge>
              </Flex>
              <Box px={4} py={3}>
                <VStack gap={2} align="stretch">
                  <InfoRow icon={Award} label="पदनाम" value={u.designation?.name || '—'} />
                  <Box h="1px" bg="gray.100" />
                  <InfoRow icon={Hash} label="PNO" value={u.pnoNumber} valueColor="#090884" bold />
                  <Box h="1px" bg="gray.100" />
                  <InfoRow icon={Phone} label="फोन" value={u.phoneNumber} />
                </VStack>
              </Box>
              <Flex borderTop="1px solid" borderColor="gray.100" px={4} py={2} justifyContent="flex-end">
                <Button size="sm" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                  onClick={() => openAssign(u)} borderRadius="4px" fontSize="13px" h="36px" px={4}>
                  <ClipboardList size={13} style={{ marginRight: 5 }} /> ड्यूटी असाइन करें
                </Button>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}
      <Box mt={3}><Text fontSize="12px" color="gray.500">कुल {filtered.length} उपलब्ध अधिकारी</Text></Box>

      {/* Assign Modal */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="ड्यूटी असाइन करें">
        <form onSubmit={handleAssign}>
          <VStack gap={4}>
            <Box w="full" p={3} bg="gray.50" borderRadius="sm" borderLeft="3px solid #090884">
              <Text fontSize="12px" color="gray.500">अधिकारी:</Text>
              <Text fontSize="14px" fontWeight="700" color="gray.700">{selectedOfficer?.name}</Text>
              <Text fontSize="12px" color="gray.500">{selectedOfficer?.pnoNumber} • {selectedOfficer?.designation?.name}</Text>
            </Box>
            <FF label="ड्यूटी चुनें *">
              <select value={assignForm.dutyId} onChange={(e) => setAssignForm({ ...assignForm, dutyId: e.target.value })}
                required style={selectStyle}>
                <option value="">-- उपलब्ध ड्यूटी चुनें --</option>
                {pendingDuties.map(d => (
                  <option key={d._id} value={d._id}>{d.title} — {d.location || 'स्थान नहीं'}</option>
                ))}
              </select>
              {pendingDuties.length === 0 ? (
                <Box mt={2} p={3} bg="#fff3cd" borderRadius="6px" border="1px solid #856404">
                  <Text fontSize="12px" color="#856404" fontWeight="600">
                    ⚠️ कोई उपलब्ध ड्यूटी नहीं है
                  </Text>
                  <Text fontSize="11px" color="#856404" mt={1}>
                    पहले नई ड्यूटी बनाएं या Duties पेज पर जाएं।
                  </Text>
                </Box>
              ) : (
                <Text fontSize="11px" color="gray.500" mt={1}>
                  ✅ {pendingDuties.length} उपलब्ध ड्यूटी
                </Text>
              )}
            </FF>
            <FF label="ड्यूटी प्रकार *">
              <select value={assignForm.dutyType} onChange={(e) => setAssignForm({ ...assignForm, dutyType: e.target.value })}
                required style={selectStyle}>
                <option value="patrol">गश्त (Patrol)</option>
                <option value="guard">पहरा (Guard)</option>
                <option value="investigation">जांच (Investigation)</option>
                <option value="traffic">यातायात (Traffic)</option>
                <option value="special">विशेष (Special)</option>
                <option value="other">अन्य (Other)</option>
              </select>
            </FF>
            <FF label="शुरू तारीख *">
              <Input type="datetime-local" value={assignForm.startDate}
                onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })} required fontSize="14px" />
            </FF>
            <FF label="समाप्ति तारीख">
              <Input type="datetime-local" value={assignForm.endDate}
                onChange={(e) => setAssignForm({ ...assignForm, endDate: e.target.value })} fontSize="14px" />
            </FF>
            <FF label="टिप्पणी">
              <Input placeholder="असाइनमेंट की टिप्पणी..." value={assignForm.remarks}
                onChange={(e) => setAssignForm({ ...assignForm, remarks: e.target.value })} fontSize="14px" />
            </FF>
            <Flex gap={3} w="full" pt={2}
              flexDirection={{ base: 'column', sm: 'row' }}
              justifyContent={{ base: 'stretch', sm: 'flex-end' }}>
              <Button variant="outline" onClick={() => setAssignModal(false)} fontSize="14px"
                w={{ base: 'full', sm: 'auto' }} h="40px">रद्द करें</Button>
              <Button type="submit" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                loading={saving} loadingText="असाइन हो रहा है..." fontSize="14px"
                isDisabled={pendingDuties.length === 0}
                w={{ base: 'full', sm: 'auto' }} h="40px">असाइन करें</Button>
            </Flex>
          </VStack>
        </form>
      </Modal>
    </Box>
  );
};

const InfoRow = ({ icon: Icon, label, value, valueColor = 'gray.700', bold = false }) => (
  <Flex justifyContent="space-between" alignItems="center">
    <HStack gap={2} color="gray.500"><Icon size={14} /><Text fontSize="12px">{label}</Text></HStack>
    <Text fontSize="13px" fontWeight={bold ? '700' : '500'} color={valueColor} fontFamily={bold ? 'monospace' : 'inherit'}>{value}</Text>
  </Flex>
);

const FF = ({ label, children }) => (
  <Box w="full"><Text fontSize="13px" color="gray.600" mb={1} fontWeight="500">{label}</Text>{children}</Box>
);

const selectStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none', background: 'white' };

const Loader = () => (
  <Flex h="60vh" alignItems="center" justifyContent="center">
    <VStack><Spinner size="xl" color="#090884" /><Text color="gray.500">लोड हो रहा है...</Text></VStack>
  </Flex>
);

export default AvailableOfficers;
