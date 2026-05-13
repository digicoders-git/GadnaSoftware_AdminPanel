import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, Input, VStack, HStack, Badge, Table, Spinner,
} from '@chakra-ui/react';
import { Users, Search, Pencil, Trash2, Phone, Hash, Award, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getUsers, updateUser, deleteUser, getDesignations } from '../../api/services';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';

const ActiveOfficers = () => {
  const [users, setUsers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', designation: '', phoneNumber: '', pnoNumber: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [uRes, dRes] = await Promise.all([getUsers(true), getDesignations()]);
      setUsers(uRes.data.filter(u => u.isActive));
      setDesignations(dRes.data);
    } catch { toast.error('डेटा लोड करने में समस्या हुई'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, designation: u.designation?._id || u.designation, phoneNumber: u.phoneNumber, pnoNumber: u.pnoNumber, isActive: u.isActive });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('कृपया नाम दर्ज करें'); return; }
    if (!form.designation) { toast.error('कृपया पदनाम चुनें'); return; }
    setSaving(true);
    try {
      await updateUser(editing._id, form);
      toast.success(`${form.name} की जानकारी अपडेट हो गई`);
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'कुछ गलत हुआ'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (u) => {
    try {
      await updateUser(u._id, { isActive: !u.isActive });
      toast.success(`${u.name} को ${!u.isActive ? 'सक्रिय' : 'निष्क्रिय'} किया गया`);
      fetchData();
    } catch { toast.error('स्थिति बदलने में समस्या हुई'); }
  };

  const askDelete = (u) => setConfirmState({ open: true, id: u._id, name: u.name });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(confirmState.id);
      toast.success(`${confirmState.name} को हटा दिया गया`);
      setConfirmState({ open: false, id: null, name: '' }); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'हटाने में समस्या हुई'); }
    finally { setDeleting(false); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.pnoNumber?.toLowerCase().includes(search.toLowerCase()) ||
    u.phoneNumber?.includes(search)
  );

  if (loading) return <Loader />;

  return (
    <Box>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb={5}
        bg="white" p={4} borderRadius="sm" boxShadow="sm" flexWrap="wrap" gap={2}
        borderLeft="4px solid #090884">
        <HStack gap={3}>
          <Box bg="#090884" p={2} borderRadius="sm"><Users size={20} color="white" /></Box>
          <Box>
            <Text fontSize={{ base: '16px', md: '20px' }} fontWeight="700" color="gray.700">कुल सक्रिय अधिकारी</Text>
            <Text fontSize="12px" color="gray.500">सभी सक्रिय पुलिस अधिकारियों की सूची</Text>
          </Box>
        </HStack>
        <HStack gap={2} cursor="pointer" onClick={() => navigate('/dashboard')}
          color="gray.400" _hover={{ color: '#090884' }} transition="0.2s">
          <ArrowLeft size={15} />
          <Text fontSize="12px">डैशबोर्ड</Text>
        </HStack>
      </Flex>

      {/* Search */}
      <Flex mb={4}>
        <Flex border="1px solid" borderColor="gray.300" borderRadius="4px"
          alignItems="center" px={3} bg="white" w={{ base: 'full', sm: '300px' }}>
          <Search size={15} color="#999" />
          <Input border="none" _focus={{ boxShadow: 'none' }} placeholder="नाम, PNO या फोन खोजें..."
            value={search} onChange={(e) => setSearch(e.target.value)} fontSize="14px" h="38px" />
        </Flex>
      </Flex>

      {/* Desktop Table */}
      <Box display={{ base: 'none', md: 'block' }} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="sm">
            <Table.Header bg="#f8f9fa">
              <Table.Row>
                {['#', 'नाम', 'पदनाम', 'PNO', 'फोन', 'स्थिति', 'कार्रवाई'].map(h => (
                  <Table.ColumnHeader key={h} px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">{h}</Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.length === 0 ? (
                <Table.Row><Table.Cell colSpan={7} textAlign="center" py={10} color="gray.400">कोई अधिकारी नहीं मिला</Table.Cell></Table.Row>
              ) : filtered.map((u, i) => (
                <Table.Row key={u._id} _hover={{ bg: 'gray.50' }}>
                  <Table.Cell px={4} py={3} fontSize="13px" color="gray.500">{i + 1}</Table.Cell>
                  <Table.Cell px={4} py={3}><Text fontSize="14px" fontWeight="600" color="gray.700">{u.name}</Text></Table.Cell>
                  <Table.Cell px={4} py={3}><Text fontSize="13px" color="gray.600">{u.designation?.name || '—'}</Text></Table.Cell>
                  <Table.Cell px={4} py={3}><Text fontSize="13px" fontFamily="monospace" color="#090884" fontWeight="600">{u.pnoNumber}</Text></Table.Cell>
                  <Table.Cell px={4} py={3}><Text fontSize="13px" color="gray.600">{u.phoneNumber}</Text></Table.Cell>
                  <Table.Cell px={4} py={3}>
                    <Badge bg={u.isActive ? '#eeeeff' : '#f8d7da'} color={u.isActive ? '#090884' : '#721c24'}
                      px={2} py={1} borderRadius="full" fontSize="11px">
                      {u.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell px={4} py={3}>
                    <HStack gap={2}>
                      <ToggleSwitch isActive={u.isActive} onChange={() => handleToggle(u)} />
                      <Button size="xs" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                        onClick={() => openEdit(u)} borderRadius="4px" px={3} fontSize="12px">
                        <Pencil size={11} style={{ marginRight: 4 }} /> संपादित
                      </Button>
                      <Button size="xs" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                        onClick={() => askDelete(u)} borderRadius="4px" px={3} fontSize="12px">
                        <Trash2 size={11} style={{ marginRight: 4 }} /> हटाएं
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
        <Box px={4} py={2} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
          <Text fontSize="12px" color="gray.500">कुल {filtered.length} सक्रिय अधिकारी</Text>
        </Box>
      </Box>

      {/* Mobile Cards */}
      <Box display={{ base: 'block', md: 'none' }}>
        {filtered.length === 0 ? (
          <Box bg="white" borderRadius="sm" p={8} textAlign="center" boxShadow="sm">
            <Text color="gray.400">कोई अधिकारी नहीं मिला</Text>
          </Box>
        ) : (
          <VStack gap={3} align="stretch">
            {filtered.map((u, i) => (
              <Box key={u._id} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
                <Flex bg="#090884" px={4} py={3} justifyContent="space-between" alignItems="center">
                  <HStack gap={2}>
                    <Box bg="rgba(255,255,255,0.2)" borderRadius="full" w="28px" h="28px"
                      display="flex" alignItems="center" justifyContent="center">
                      <Text color="white" fontSize="12px" fontWeight="700">{i + 1}</Text>
                    </Box>
                    <Text color="white" fontSize="15px" fontWeight="700">{u.name}</Text>
                  </HStack>
                  <Badge bg={u.isActive ? '#eeeeff' : '#f8d7da'} color={u.isActive ? '#090884' : '#721c24'}
                    px={2} py={1} borderRadius="full" fontSize="11px">
                    {u.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                  </Badge>
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
                <Flex borderTop="1px solid" borderColor="gray.100" px={4} py={2} gap={2} justifyContent="flex-end" alignItems="center">
                  <ToggleSwitch isActive={u.isActive} onChange={() => handleToggle(u)} />
                  <Button size="sm" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                    onClick={() => openEdit(u)} borderRadius="4px" fontSize="13px">
                    <Pencil size={13} style={{ marginRight: 4 }} /> संपादित करें
                  </Button>
                  <Button size="sm" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                    onClick={() => askDelete(u)} borderRadius="4px" fontSize="13px">
                    <Trash2 size={13} style={{ marginRight: 4 }} /> हटाएं
                  </Button>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
        <Box mt={3}><Text fontSize="12px" color="gray.500">कुल {filtered.length} सक्रिय अधिकारी</Text></Box>
      </Box>

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={`अधिकारी संपादित करें — ${editing?.name}`}>
        <form onSubmit={handleSave}>
          <VStack gap={4}>
            <FF label="पूरा नाम *">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fontSize="14px" />
            </FF>
            <FF label="पदनाम *">
              <select value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required style={selectStyle}>
                <option value="">-- पदनाम चुनें --</option>
                {designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </FF>
            <FF label="PNO नंबर *">
              <Input value={form.pnoNumber} onChange={(e) => setForm({ ...form, pnoNumber: e.target.value })} required fontSize="14px" />
            </FF>
            <FF label="फोन नंबर *">
              <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required fontSize="14px" />
            </FF>
            <FF label="स्थिति">
              <select value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} style={selectStyle}>
                <option value="true">सक्रिय</option>
                <option value="false">निष्क्रिय</option>
              </select>
            </FF>
            <Flex gap={3} w="full" justifyContent="flex-end" pt={2}>
              <Button variant="outline" onClick={() => setModalOpen(false)} fontSize="14px">रद्द करें</Button>
              <Button type="submit" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                loading={saving} loadingText="सहेजा जा रहा है..." fontSize="14px">अपडेट करें</Button>
            </Flex>
          </VStack>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirmState.open} onClose={() => setConfirmState({ open: false, id: null, name: '' })}
        onConfirm={handleDelete} loading={deleting} type="danger" title="अधिकारी हटाएं"
        message={`क्या आप सच में "${confirmState.name}" को हटाना चाहते हैं?`}
        confirmText="हाँ, हटाएं" cancelText="नहीं, रहने दें" />
    </Box>
  );
};

const ToggleSwitch = ({ isActive, onChange }) => (
  <Box as="button" type="button" onClick={onChange} w="36px" h="20px"
    bg={isActive ? '#090884' : '#ccc'} borderRadius="full" position="relative"
    transition="background 0.2s" flexShrink={0} cursor="pointer" border="none" outline="none">
    <Box position="absolute" top="2px" left={isActive ? '18px' : '2px'}
      w="16px" h="16px" bg="white" borderRadius="full" transition="left 0.2s"
      boxShadow="0 1px 3px rgba(0,0,0,0.3)" />
  </Box>
);

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

export default ActiveOfficers;
