import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, Input, VStack, HStack, Badge, SimpleGrid, Spinner,
} from '@chakra-ui/react';
import { Umbrella, ArrowLeft, Phone, Hash, Calendar, FileText, Search, Pencil, Trash2, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getUsers, updateHoliday, deleteHoliday, getUserHistory } from '../../api/services';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';

const OnHolidayOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = `?status=onHoliday&page=${page}&limit=${limit}&search=${search}`;
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
  }, [page, limit, search]);

  const openEdit = (u) => {
    const h = u.currentHoliday;
    setEditing({ ...h, userId: u._id, name: u.name });
    setForm({ 
      startDate: h.startDate?.slice(0, 10) || '', 
      endDate: h.endDate?.slice(0, 10) || '', 
      reason: h.reason || '' 
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) { toast.error('कृपया तारीख चुनें'); return; }
    if (new Date(form.startDate) >= new Date(form.endDate)) { toast.error('समाप्ति तारीख बाद की होनी चाहिए'); return; }
    setSaving(true);
    try {
      await updateHoliday(editing._id, form);
      toast.success('छुट्टी सफलतापूर्वक अपडेट हो गई');
      setModalOpen(false); 
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'कुछ गलत हुआ'); }
    finally { setSaving(false); }
  };

  const askDelete = (u) => {
    const h = u.currentHoliday;
    setDeleteConfirm({ open: true, id: h._id, name: u.name });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteHoliday(deleteConfirm.id);
      toast.success(`${deleteConfirm.name} की छुट्टी डिलीट कर दी गई`);
      setDeleteConfirm({ open: false, id: null, name: '' }); 
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'डिलीट करने में समस्या हुई'); }
    finally { setDeleting(false); }
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
          <Box bg="#fe0808" p={2} borderRadius="sm"><Umbrella size={20} color="white" /></Box>
          <Box>
            <Text fontSize={{ base: '16px', md: '20px' }} fontWeight="700" color="gray.700">छुट्टी पर फोर्स स्टाफ</Text>
            <Text fontSize="12px" color="gray.500">वर्तमान में चल रही छुट्टियाँ (Server-side Pagination)</Text>
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
          <Umbrella size={32} color="#ccc" style={{ margin: '0 auto 8px' }} />
          <Text color="gray.500" fontWeight="600">कोई फोर्स स्टाफ छुट्टी पर नहीं है</Text>
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
                  <Badge bg="white" color="#fe0808" px={2} py={0.5} borderRadius="full" fontSize="10px">छुट्टी पर</Badge>
                </Flex>
                <Box px={4} py={3}>
                  <VStack gap={2} align="stretch">
                    <InfoRow icon={Hash} label="PNO" value={u.pnoNumber} valueColor="#090884" bold />
                    <Box h="1px" bg="gray.100" />
                    <InfoRow icon={Phone} label="फोन" value={u.phoneNumber || '—'} />
                    <Box h="1px" bg="gray.100" />
                    <InfoRow icon={Calendar} label="शुरू" value={new Date(u.currentHoliday?.startDate).toLocaleDateString('hi-IN')} />
                    <Box h="1px" bg="gray.100" />
                    <InfoRow icon={Calendar} label="समाप्ति" value={new Date(u.currentHoliday?.endDate).toLocaleDateString('hi-IN')} />
                    {u.currentHoliday?.reason && (
                      <>
                        <Box h="1px" bg="gray.100" />
                        <InfoRow icon={FileText} label="कारण" value={u.currentHoliday.reason} />
                      </>
                    )}
                  </VStack>
                </Box>
                <Flex borderTop="1px solid" borderColor="gray.100" px={4} py={2} gap={2} flexWrap="wrap">
                  <Button size="xs" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                    onClick={() => openHistory(u._id)} borderRadius="4px" fontSize="11px" flex="1" h="30px">
                    <History size={11} style={{ marginRight: 3 }} /> इतिहास
                  </Button>
                  <Button size="xs" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                    onClick={() => openEdit(u)} borderRadius="4px" fontSize="11px" flex="1" h="30px">
                    <Pencil size={11} style={{ marginRight: 3 }} /> एडिट
                  </Button>
                  <Button size="xs" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                    onClick={() => askDelete(u)} borderRadius="4px" fontSize="11px" flex="1" h="30px">
                    <Trash2 size={11} style={{ marginRight: 3 }} /> डिलीट
                  </Button>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>

          {/* Pagination */}
          <Flex justifyContent="space-between" alignItems="center" pt={4} borderTop="1px solid" borderColor="gray.100">
            <Text fontSize="13px" color="gray.500">कुल <b>{totalCount}</b> फोर्स स्टाफ छुट्टी पर</Text>
            <HStack gap={2}>
              <Button size="sm" variant="outline" onClick={() => handlePageChange(page - 1)} disabled={page === 1} fontSize="12px">पिछला</Button>
              <Text fontSize="12px" fontWeight="600">पेज {page} / {totalPages}</Text>
              <Button size="sm" variant="outline" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} fontSize="12px">अगला</Button>
            </HStack>
          </Flex>
        </VStack>
      )}

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="छुट्टी एडिट करें">
        <form onSubmit={handleSave}>
          <VStack gap={4}>
            <Box w="full" p={3} bg="gray.50" borderRadius="sm" borderLeft="3px solid #fe0808">
              <Text fontSize="12px" color="gray.500">फोर्स स्टाफ:</Text>
              <Text fontSize="14px" fontWeight="700" color="gray.700">{editing?.name}</Text>
              <Text fontSize="12px" color="gray.500">{editing?.pnoNumber}</Text>
            </Box>
            <FF label="शुरू तारीख *">
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required fontSize="14px" />
            </FF>
            <FF label="समाप्ति तारीख *">
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required fontSize="14px" />
            </FF>
            <FF label="कारण">
              <Input placeholder="जैसे: वार्षिक अवकाश" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} fontSize="14px" />
            </FF>
            <Flex gap={3} w="full" justifyContent="flex-end" pt={2}>
              <Button variant="outline" onClick={() => setModalOpen(false)} fontSize="14px">रद्द करें</Button>
              <Button type="submit" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                loading={saving} loadingText="सहेजा जा रहा है..." fontSize="14px">अपडेट करें</Button>
            </Flex>
          </VStack>
        </form>
      </Modal>

      <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        onConfirm={handleDelete} loading={deleting} type="warning" title="छुट्टी डिलीट करें"
        message={`क्या आप सच में ${deleteConfirm.name} की छुट्टी डिलीट करना चाहते हैं?`}
        confirmText="हाँ, डिलीट करें" cancelText="नहीं, रहने दें" />

      {/* History Modal */}
      <Modal isOpen={historyModal} onClose={() => setHistoryModal(false)} title="ड्यूटी इतिहास">
        {historyLoading ? (
          <Flex h="150px" alignItems="center" justifyContent="center"><Spinner color="#090884" /></Flex>
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
              <Text color="gray.400" textAlign="center" fontSize="13px">कोई ड्यूटी इतिहास नहीं</Text>
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

const FF = ({ label, children }) => (
  <Box w="full"><Text fontSize="13px" color="gray.600" mb={1} fontWeight="500">{label}</Text>{children}</Box>
);

export default OnHolidayOfficers;
