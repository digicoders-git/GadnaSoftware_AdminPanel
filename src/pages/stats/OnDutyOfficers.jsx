import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, VStack, HStack, Badge, SimpleGrid, Spinner, Input,
} from '@chakra-ui/react';
import { MapPin, ArrowLeft, Phone, Hash, Award, UserX, CheckCircle, History, Search, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUsers, removeDutyAssignment, completeDuty, getUserHistory } from '../../api/services';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';

const DUTY_TYPE_HINDI = {
  patrol: 'गश्त', guard: 'पहरा', investigation: 'जांच',
  traffic: 'यातायात', special: 'विशेष', other: 'अन्य',
};

const OnDutyOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [remarkText, setRemarkText] = useState('');
  const [removeConfirm, setRemoveConfirm] = useState({ open: false, item: null });
  const [completeConfirm, setCompleteConfirm] = useState({ open: false, item: null });
  const [saving, setSaving] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParamsRaw = new URLSearchParams(location.search);
  const dutyTypeFilter = queryParamsRaw.get('type') || '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = `?status=onDuty&page=${page}&limit=${limit}&search=${search}${dutyTypeFilter ? `&dutyType=${dutyTypeFilter}` : ''}`;
      const { data } = await getUsers(queryParams);
      setOfficers(data.users);
      setTotalPages(data.pages);
      setTotalCount(data.total);
    } catch { toast.error('डेटा लोड करने में समस्या हुई'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, limit, search, dutyTypeFilter]);

  const handleRemove = async () => {
    setSaving(true);
    try {
      await removeDutyAssignment(removeConfirm.item.activeDuty._id, { 
        remarks: remarkText,
        userId: removeConfirm.item._id 
      });
      toast.success(`${removeConfirm.item.name} को ड्यूटी से हटा दिया गया`);
      setRemoveConfirm({ open: false, item: null }); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'हटाने में समस्या हुई'); }
    finally { setSaving(false); }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await completeDuty(completeConfirm.item.activeDuty._id, { 
        remarks: remarkText,
        userId: completeConfirm.item._id 
      });
      toast.success(`ड्यूटी "${completeConfirm.item.activeDuty.title}" पूर्ण हो गई`);
      setCompleteConfirm({ open: false, item: null }); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'पूर्ण करने में समस्या हुई'); }
    finally { setSaving(false); }
  };

  const openHistory = async (userId) => {
    setHistoryModal(true);
    setHistoryLoading(true);
    try {
      const { data } = await getUserHistory(userId);
      setHistoryData(data);
    } catch { toast.error('इतिहास लोड नहीं हुआ'); }
    finally { setHistoryLoading(false); }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={5}
        bg="white" p={4} borderRadius="sm" boxShadow="sm" flexWrap="wrap" gap={2}
        borderLeft="4px solid #fe0808">
        <HStack gap={3}>
          <Box bg="#fe0808" p={2} borderRadius="sm"><MapPin size={20} color="white" /></Box>
          <Box>
            <Text fontSize={{ base: '16px', md: '20px' }} fontWeight="700" color="gray.700">ड्यूटी पर फोर्स स्टाफ</Text>
            <Text fontSize="12px" color="gray.500">वर्तमान में सक्रिय ड्यूटी पर तैनात फोर्स स्टाफ (Server-side Pagination)</Text>
          </Box>
        </HStack>
        <HStack gap={2} cursor="pointer" onClick={() => navigate('/dashboard')}
          color="gray.400" _hover={{ color: '#090884' }} transition="0.2s">
          <ArrowLeft size={15} />
          <Text fontSize="12px">डैशबोर्ड</Text>
        </HStack>
      </Flex>

      <Flex justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={3}>
        <Flex border="1px solid" borderColor="gray.300" borderRadius="4px"
          alignItems="center" px={3} bg="white" w={{ base: 'full', sm: '300px' }}>
          <Search size={15} color="#999" />
          <Input border="none" _focus={{ boxShadow: 'none' }} placeholder="नाम या PNO खोजें..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} fontSize="14px" h="38px" />
        </Flex>

        <HStack gap={2}>
          <Text fontSize="13px" color="gray.500">दिखाएं:</Text>
          <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }} 
            style={{ padding: '6px 10px', borderRadius: '4px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', background: 'white' }}>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </HStack>
      </Flex>

      {loading ? (
        <Flex h="300px" align="center" justify="center"><Spinner color="#fe0808" /></Flex>
      ) : officers.length === 0 ? (
        <Box bg="white" borderRadius="sm" p={10} textAlign="center" boxShadow="sm">
          <MapPin size={32} color="#ccc" style={{ margin: '0 auto 8px' }} />
          <Text color="gray.500" fontWeight="600">कोई फोर्स स्टाफ ड्यूटी पर नहीं है</Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={6}>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap={4}>
            {officers.map((u, i) => (
              <Box key={u._id} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden"
                borderLeft="4px solid #fe0808">
                <Flex bg="#fe0808" px={4} py={3} justifyContent="space-between" alignItems="center">
                  <HStack gap={2}>
                    <Box bg="rgba(255,255,255,0.2)" borderRadius="full" w="26px" h="26px"
                      display="flex" alignItems="center" justifyContent="center">
                      <Text color="white" fontSize="11px" fontWeight="700">{(page - 1) * limit + i + 1}</Text>
                    </Box>
                    <Text color="white" fontSize="14px" fontWeight="700" noOfLines={1}>{u.name}</Text>
                  </HStack>
                  <Badge bg="white" color="#fe0808" px={2} py={0.5} borderRadius="full" fontSize="10px">
                    {DUTY_TYPE_HINDI[u.activeDuty?.assignment?.dutyType || u.activeDuty?.dutyType] || (u.activeDuty?.assignment?.dutyType || u.activeDuty?.dutyType)}
                  </Badge>
                </Flex>
                <Box px={4} py={3}>
                  <VStack gap={2} align="stretch">
                    <InfoRow icon={Award} label="पदनाम" value={u.designation?.name || '—'} />
                    <Box h="1px" bg="gray.100" />
                    <InfoRow icon={Hash} label="PNO" value={u.pnoNumber} valueColor="#090884" bold />
                    {u.activeDuty?.description && (
                      <Text fontSize="10px" color="gray.500" fontStyle="italic" mt={-1} mb={1}>
                        {u.activeDuty.description}
                      </Text>
                    )}
                    <Box h="1px" bg="gray.100" />
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text fontSize="11px" color="gray.500">ड्यूटी</Text>
                      <Text fontSize="12px" fontWeight="600" color="#fe0808" noOfLines={1} maxW="60%">
                        {u.activeDuty?.title}
                      </Text>
                    </Flex>
                    {u.activeDuty?.location && (
                      <Flex justifyContent="space-between">
                        <Text fontSize="11px" color="gray.500">स्थान</Text>
                        <Text fontSize="12px" color="gray.600">{u.activeDuty.location}</Text>
                      </Flex>
                    )}
                    {u.activeDuty?.assignment?.remarks && (
                      <Box bg="red.50" p={2} borderRadius="sm" mt={1}>
                        <HStack gap={1} mb={0.5}>
                          <ClipboardList size={10} color="#fe0808" />
                          <Text fontSize="9px" fontWeight="700" color="#fe0808">विवरण/टिप्पणी:</Text>
                        </HStack>
                        <Text fontSize="10px" color="#fe0808" fontWeight="500">
                          {u.activeDuty.assignment.remarks}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Box>
                <Flex borderTop="1px solid" borderColor="gray.100" px={4} py={2} gap={2} flexWrap="wrap">
                  <Button size="xs" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                    onClick={() => openHistory(u._id)} borderRadius="4px" fontSize="11px" flex="1" h="30px">
                    <History size={11} style={{ marginRight: 3 }} /> इतिहास
                  </Button>
                  <Button size="xs" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                    onClick={() => { setRemarkText(''); setRemoveConfirm({ open: true, item: u }); }}
                    borderRadius="4px" fontSize="11px" flex="1" h="30px">
                    <UserX size={11} style={{ marginRight: 3 }} /> हटाएँ
                  </Button>
                  <Button size="xs" bg="#22c55e" color="white" _hover={{ bg: '#16a34a' }}
                    onClick={() => { setRemarkText(''); setCompleteConfirm({ open: true, item: u }); }}
                    borderRadius="4px" fontSize="11px" flex="1" h="30px">
                    <CheckCircle size={11} style={{ marginRight: 3 }} /> पूर्ण
                  </Button>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>

          {/* Pagination */}
          <Flex justifyContent="space-between" alignItems="center" pt={4} borderTop="1px solid" borderColor="gray.100">
            <Text fontSize="13px" color="gray.500">कुल <b>{totalCount}</b> फोर्स स्टाफ ड्यूटी पर</Text>
            <HStack gap={2}>
              <Button size="sm" variant="outline" onClick={() => handlePageChange(page - 1)} disabled={page === 1} fontSize="12px">पिछला</Button>
              <Text fontSize="12px" fontWeight="600">पेज {page} / {totalPages}</Text>
              <Button size="sm" variant="outline" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} fontSize="12px">अगला</Button>
            </HStack>
          </Flex>
        </VStack>
      )}

      {/* Remove Confirm */}
      <ConfirmDialog isOpen={removeConfirm.open}
        onClose={() => setRemoveConfirm({ open: false, item: null })}
        onConfirm={handleRemove} loading={saving} type="warning"
        title="असाइनमेंट डिलीट"
        message={`क्या आप "${removeConfirm.item?.name}" को ड्यूटी "${removeConfirm.item?.activeDuty?.title}" से हटाना चाहते हैं?`}
        confirmText="हाँ, डिलीट" cancelText="नहीं, रहने दें" />

      {/* Complete Confirm */}
      <ConfirmDialog isOpen={completeConfirm.open}
        onClose={() => setCompleteConfirm({ open: false, item: null })}
        onConfirm={handleComplete} loading={saving} type="success"
        title="ड्यूटी पूर्ण करें"
        message={`क्या आप पुष्टि करते हैं कि "${completeConfirm.item?.name}" की ड्यूटी "${completeConfirm.item?.activeDuty?.title}" पूर्ण हो गई?`}
        confirmText="हाँ, पूर्ण करें" cancelText="नहीं, रहने दें" />

      {/* History Modal */}
      <Modal isOpen={historyModal} onClose={() => setHistoryModal(false)} title="ड्यूटी इतिहास">
        {historyLoading ? (
          <Flex h="150px" alignItems="center" justifyContent="center">
            <Spinner color="#090884" />
          </Flex>
        ) : historyData ? (
          <VStack gap={3} align="stretch" maxH="400px" overflowY="auto">
            <SimpleGrid columns={4} gap={2}>
              {[
                { label: 'कुल', value: historyData.stats?.totalAssignments },
                { label: 'पूर्ण', value: historyData.stats?.totalCompleted },
                { label: 'हटाई', value: historyData.stats?.totalRemoved },
                { label: 'घंटे', value: historyData.stats?.totalHours },
              ].map(s => (
                <Box key={s.label} bg="gray.50" borderRadius="sm" p={2} textAlign="center">
                  <Text fontSize="16px" fontWeight="700" color="#090884">{s.value}</Text>
                  <Text fontSize="10px" color="gray.500">{s.label}</Text>
                </Box>
              ))}
            </SimpleGrid>
            {historyData.history?.length === 0 ? (
              <Text color="gray.400" textAlign="center" fontSize="13px">कोई इतिहास नहीं</Text>
            ) : historyData.history?.map((h) => (
              <Box key={h._id} p={3} bg="gray.50" borderRadius="sm" borderLeft={`3px solid ${actionColor(h.action)}`}>
                <Flex justifyContent="space-between" alignItems="flex-start">
                  <Text fontSize="13px" fontWeight="600" color="gray.700">{h.duty?.title || '—'}</Text>
                  <Badge bg={actionBg(h.action)} color={actionColor(h.action)} px={2} borderRadius="full" fontSize="10px">
                    {actionHindi(h.action)}
                  </Badge>
                </Flex>
                <Flex gap={3} mt={1} flexWrap="wrap">
                  {h.duration && <Text fontSize="11px" color="gray.500">{h.duration} घंटे</Text>}
                  <Text fontSize="11px" color="gray.400">{new Date(h.createdAt).toLocaleDateString('hi-IN')}</Text>
                </Flex>
              </Box>
            ))}
          </VStack>
        ) : null}
      </Modal>
    </Box>
  );
};

const actionHindi = (a) => ({ assigned: 'असाइन', reassigned: 'पुनः असाइन', removed: 'हटाया', completed: 'पूर्ण' }[a] || a);
const actionColor = (a) => ({ assigned: '#090884', reassigned: '#856404', removed: '#fe0808', completed: '#22c55e' }[a] || '#666');
const actionBg = (a) => ({ assigned: '#eeeeff', reassigned: '#fff3cd', removed: '#ffe5e5', completed: '#dcfce7' }[a] || '#f8f9fa');

const InfoRow = ({ icon: Icon, label, value, valueColor = 'gray.700', bold = false }) => (
  <Flex justifyContent="space-between" alignItems="center">
    <HStack gap={2} color="gray.500"><Icon size={14} /><Text fontSize="12px">{label}</Text></HStack>
    <Text fontSize="13px" fontWeight={bold ? '700' : '500'} color={valueColor} fontFamily={bold ? 'monospace' : 'inherit'}>{value}</Text>
  </Flex>
);

export default OnDutyOfficers;
