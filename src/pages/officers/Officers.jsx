import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, Input, VStack, HStack, Badge, Table, Spinner,
} from '@chakra-ui/react';
import { UserPlus, Pencil, Trash2, Users, Search, Phone, Hash, Award, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getUsers, createUser, updateUser, deleteUser, getDesignations } from '../../api/services';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';

const Officers = () => {
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
      setUsers(uRes.data);
      setDesignations(dRes.data);
    } catch {
      toast.error('डेटा लोड करने में समस्या हुई');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', designation: '', phoneNumber: '', pnoNumber: '', isActive: true }); setModalOpen(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, designation: u.designation?._id || u.designation, phoneNumber: u.phoneNumber, pnoNumber: u.pnoNumber, isActive: u.isActive });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('कृपया अधिकारी का नाम दर्ज करें'); return; }
    if (!form.designation) { toast.error('कृपया पदनाम चुनें'); return; }
    if (!form.pnoNumber.trim()) { toast.error('कृपया PNO नंबर दर्ज करें'); return; }
    if (!form.phoneNumber.trim() || form.phoneNumber.length < 10) { toast.error('कृपया सही फोन नंबर दर्ज करें (10 अंक)'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateUser(editing._id, form);
        toast.success(`${form.name} की जानकारी सफलतापूर्वक अपडेट हो गई`);
      } else {
        await createUser(form);
        toast.success(`अधिकारी ${form.name} को सफलतापूर्वक जोड़ा गया`);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'कुछ गलत हुआ, दोबारा कोशिश करें');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (u) => {
    try {
      await updateUser(u._id, { isActive: !u.isActive });
      toast.success(`${u.name} को ${!u.isActive ? 'सक्रिय' : 'निष्क्रिय'} कर दिया गया`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'स्थिति बदलने में समस्या हुई');
    }
  };

  const askDelete = (u) => setConfirmState({ open: true, id: u._id, name: u.name });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(confirmState.id);
      toast.success(`अधिकारी ${confirmState.name} को हटा दिया गया`);
      setConfirmState({ open: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'हटाने में समस्या हुई');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter(
    (u) => u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.pnoNumber?.toLowerCase().includes(search.toLowerCase()) ||
      u.phoneNumber?.includes(search)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <PageHeader title="अधिकारी प्रबंधन" subtitle="सभी पुलिस अधिकारियों की सूची" icon={Users} />

      <Flex justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={3}>
        <Flex border="1px solid" borderColor="gray.300" borderRadius="4px"
          alignItems="center" px={3} bg="white" w={{ base: 'full', sm: '280px' }}>
          <Search size={15} color="#999" />
          <Input border="none" _focus={{ boxShadow: 'none' }} placeholder="नाम, PNO या फोन खोजें..."
            value={search} onChange={(e) => setSearch(e.target.value)} fontSize="14px" h="38px" />
        </Flex>
        <Button bg="#090884" color="white" _hover={{ bg: '#06066e' }} onClick={openAdd}
          fontSize="14px" h="40px" borderRadius="6px" px={5}
          w={{ base: 'full', sm: 'auto' }}>
          <UserPlus size={16} style={{ marginRight: 6 }} /> नया अधिकारी जोड़ें
        </Button>
      </Flex>

      {/* Desktop Table */}
      <Box display={{ base: 'none', md: 'block' }} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="sm">
            <Table.Header bg="#f8f9fa">
              <Table.Row>
                {['#', 'नाम', 'पदनाम', 'PNO नंबर', 'फोन नंबर', 'स्थिति', 'कार्रवाई'].map(h => (
                  <Table.ColumnHeader key={h} px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">{h}</Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} textAlign="center" py={10} color="gray.400">कोई अधिकारी नहीं मिला</Table.Cell>
                </Table.Row>
              ) : filtered.map((u, i) => (
                <Table.Row key={u._id} _hover={{ bg: 'gray.50' }}>
                  <Table.Cell px={4} py={3} fontSize="13px" color="gray.500">{i + 1}</Table.Cell>
                  <Table.Cell px={4} py={3}><Text fontSize="14px" fontWeight="600" color="gray.700">{u.name}</Text></Table.Cell>
                  <Table.Cell px={4} py={3}><Text fontSize="13px" color="gray.600">{u.designation?.name || '—'}</Text></Table.Cell>
                  <Table.Cell px={4} py={3}><Text fontSize="13px" fontFamily="monospace" color="#090884" fontWeight="600">{u.pnoNumber}</Text></Table.Cell>
                  <Table.Cell px={4} py={3}><Text fontSize="13px" color="gray.600">{u.phoneNumber}</Text></Table.Cell>
                  <Table.Cell px={4} py={3}>
                    <Badge
                      bg={u.isActive ? '#eeeeff' : '#f8d7da'}
                      color={u.isActive ? '#090884' : '#721c24'}
                      px={2} py={1} borderRadius="full" fontSize="11px">
                      {u.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell px={4} py={3}>
                    <HStack gap={2}>
                      <ToggleSwitch isActive={u.isActive} onChange={() => handleToggleStatus(u)} />
                      <Button size="xs" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                        onClick={() => openEdit(u)} borderRadius="4px" px={3} fontSize="12px">
                        <Pencil size={11} style={{ marginRight: 4 }} /> संपादित
                      </Button>
                      <Button size="xs" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                        onClick={() => askDelete(u)} borderRadius="4px" px={3} fontSize="12px">
                        <Trash2 size={11} style={{ marginRight: 4 }} /> हटाएं
                      </Button>
                      <Button size="xs" bg="gray.600" color="white" _hover={{ bg: 'gray.700' }}
                        onClick={() => navigate(`/officers/${u._id}/history`)} borderRadius="4px" px={3} fontSize="12px">
                        <History size={11} style={{ marginRight: 4 }} /> इतिहास
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
        <Box px={4} py={2} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
          <Text fontSize="12px" color="gray.500">
            कुल {filtered.length} अधिकारी
            {filtered.filter(u => !u.isActive).length > 0 && (
              <> &nbsp;•&nbsp; <span style={{color:'#721c24'}}>{filtered.filter(u => !u.isActive).length} निष्क्रिय</span></>
            )}
          </Text>
        </Box>
      </Box>

      {/* Mobile Card View */}
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
                    <Text color="white" fontSize="15px" fontWeight="700" noOfLines={1}>{u.name}</Text>
                  </HStack>
                  <HStack gap={2}>
                    <ToggleSwitch isActive={u.isActive} onChange={() => handleToggleStatus(u)} />
                    <Badge
                      bg={u.isActive ? '#eeeeff' : '#f8d7da'}
                      color={u.isActive ? '#090884' : '#721c24'}
                      px={2} py={1} borderRadius="full" fontSize="11px">
                      {u.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </Badge>
                  </HStack>
                </Flex>
                <Box px={4} py={3}>
                  <VStack gap={2} align="stretch">
                    <InfoRow icon={Award} label="पदनाम" value={u.designation?.name || '—'} />
                    <Box h="1px" bg="gray.100" />
                    <InfoRow icon={Hash} label="PNO नंबर" value={u.pnoNumber} valueColor="#090884" bold />
                    <Box h="1px" bg="gray.100" />
                    <InfoRow icon={Phone} label="फोन" value={u.phoneNumber} />
                  </VStack>
                </Box>
                <Box borderTop="1px solid" borderColor="gray.100" px={4} py={3}>
                  <VStack gap={2}>
                    <Flex gap={2} w="full">
                      <Button flex={1} size="sm" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                        onClick={() => openEdit(u)} borderRadius="6px" fontSize="13px" h="36px">
                        <Pencil size={13} style={{ marginRight: 5 }} /> संपादित
                      </Button>
                      <Button flex={1} size="sm" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                        onClick={() => askDelete(u)} borderRadius="6px" fontSize="13px" h="36px">
                        <Trash2 size={13} style={{ marginRight: 5 }} /> हटाएं
                      </Button>
                    </Flex>
                    <Button w="full" size="sm" bg="gray.600" color="white" _hover={{ bg: 'gray.700' }}
                      onClick={() => navigate(`/officers/${u._id}/history`)} borderRadius="6px" fontSize="13px" h="36px">
                      <History size={13} style={{ marginRight: 5 }} /> ड्यूटी इतिहास देखें
                    </Button>
                  </VStack>
                </Box>
              </Box>
            ))}
          </VStack>
        )}
        <Box mt={3}>
          <Text fontSize="12px" color="gray.500">
            कुल {filtered.length} अधिकारी
            {filtered.filter(u => !u.isActive).length > 0 && (
              <> &nbsp;•&nbsp; <span style={{color:'#721c24'}}>{filtered.filter(u => !u.isActive).length} निष्क्रिय</span></>
            )}
          </Text>
        </Box>
      </Box>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? `अधिकारी संपादित करें — ${editing.name}` : 'नया अधिकारी जोड़ें'}>
        <form onSubmit={handleSave}>
          <VStack gap={4}>
            <FF label="पूरा नाम *">
              <Input placeholder="जैसे: रमेश कुमार" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required fontSize="14px" />
            </FF>
            <FF label="पदनाम *">
              <select value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
                required style={selectStyle}>
                <option value="">-- पदनाम चुनें --</option>
                {designations.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </FF>
            <FF label="PNO नंबर *">
              <Input placeholder="जैसे: PNO001" value={form.pnoNumber}
                onChange={(e) => setForm({ ...form, pnoNumber: e.target.value })} required fontSize="14px" />
            </FF>
            <FF label="फोन नंबर *">
              <Input placeholder="जैसे: 9876543210" value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required fontSize="14px" />
            </FF>
            {editing && (
              <FF label="स्थिति">
                <select value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                  style={selectStyle}>
                  <option value="true">सक्रिय</option>
                  <option value="false">निष्क्रिय</option>
                </select>
              </FF>
            )}
            <Flex gap={3} w="full" pt={2}
              flexDirection={{ base: 'column', sm: 'row' }}
              justifyContent={{ base: 'stretch', sm: 'flex-end' }}>
              <Button
                onClick={() => setModalOpen(false)} fontSize="14px"
                w={{ base: 'full', sm: 'auto' }} h="40px" borderRadius="6px" px={5}
                bg="gray.100" color="gray.700" _hover={{ bg: 'gray.200' }}>
                रद्द करें
              </Button>
              <Button type="submit" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                loading={saving} loadingText="सहेजा जा रहा है..." fontSize="14px"
                w={{ base: 'full', sm: 'auto' }} h="40px" borderRadius="6px" px={5}>
                {editing ? 'अपडेट करें' : 'जोड़ें'}
              </Button>
            </Flex>
          </VStack>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmState.open}
        onClose={() => setConfirmState({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        loading={deleting}
        type="danger"
        title="अधिकारी हटाएं"
        message={`क्या आप सच में "${confirmState.name}" को हटाना चाहते हैं? यह कार्रवाई वापस नहीं की जा सकती।`}
        confirmText="हाँ, हटाएं"
        cancelText="नहीं, रहने दें"
      />
    </Box>
  );
};

const ToggleSwitch = ({ isActive, onChange }) => (
  <Box
    as="button"
    type="button"
    onClick={onChange}
    w="44px" h="24px"
    bg={isActive ? '#22c55e' : '#fe0808'}
    borderRadius="full"
    position="relative"
    transition="background 0.25s"
    flexShrink={0}
    cursor="pointer"
    border="none"
    outline="none"
    _focus={{ boxShadow: 'none' }}
    boxShadow={isActive ? '0 0 0 3px rgba(34,197,94,0.25)' : '0 0 0 3px rgba(254,8,8,0.2)'}
  >
    <Box
      position="absolute"
      top="3px"
      left={isActive ? '23px' : '3px'}
      w="18px" h="18px"
      bg="white"
      borderRadius="full"
      transition="left 0.25s"
      boxShadow="0 2px 4px rgba(0,0,0,0.3)"
    />
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

const LoadingSpinner = () => (
  <Flex h="60vh" alignItems="center" justifyContent="center">
    <VStack><Spinner size="xl" color="#090884" /><Text color="gray.500">लोड हो रहा है...</Text></VStack>
  </Flex>
);

export default Officers;
