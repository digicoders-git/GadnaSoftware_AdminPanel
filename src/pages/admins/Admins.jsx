import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, Input, VStack, HStack, Badge, Table, Spinner,
} from '@chakra-ui/react';
import { UserCog, Plus, Pencil, Trash2, Search, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';

const Admins = () => {
  const { admin: currentAdmin } = useAuth();
  const isSuperAdmin = currentAdmin?.role === 'superadmin';

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await getAdmins();
      setList(data);
    } catch {
      toast.error('डेटा लोड करने में समस्या हुई');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', role: 'admin' });
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({ name: a.name, email: a.email, password: '', role: a.role });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('कृपया नाम दर्ज करें'); return; }
    if (!form.email.trim()) { toast.error('कृपया ईमेल दर्ज करें'); return; }
    if (!editing && !form.password) { toast.error('कृपया पासवर्ड दर्ज करें'); return; }
    setSaving(true);
    try {
      if (editing) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await updateAdmin(editing._id, payload);
        toast.success(`${form.name} की जानकारी सफलतापूर्वक अपडेट हो गई`);
      } else {
        await createAdmin(form);
        toast.success(`एडमिन ${form.name} को सफलतापूर्वक जोड़ा गया`);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'कुछ गलत हुआ, दोबारा कोशिश करें');
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (a) => {
    if (a._id === currentAdmin?._id) { toast.error('आप अपना खुद का अकाउंट नहीं हटा सकते'); return; }
    setConfirmState({ open: true, id: a._id, name: a.name });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdmin(confirmState.id);
      toast.success(`एडमिन ${confirmState.name} को हटा दिया गया`);
      setConfirmState({ open: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'हटाने में समस्या हुई');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = list.filter(
    (a) => a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <Flex h="60vh" alignItems="center" justifyContent="center">
      <VStack><Spinner size="xl" color="#090884" /><Text color="gray.500">लोड हो रहा है...</Text></VStack>
    </Flex>
  );

  return (
    <Box>
      <PageHeader title="एडमिन प्रबंधन" subtitle="सिस्टम एडमिन को प्रबंधित करें" icon={UserCog} />

      <Flex justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={3}>
        <Flex border="1px solid" borderColor="gray.300" borderRadius="4px"
          alignItems="center" px={3} bg="white" w={{ base: 'full', sm: '280px' }}>
          <Search size={15} color="#999" />
          <Input border="none" _focus={{ boxShadow: 'none' }} placeholder="नाम या ईमेल खोजें..."
            value={search} onChange={(e) => setSearch(e.target.value)} fontSize="14px" h="38px" />
        </Flex>
        {isSuperAdmin && (
          <Button bg="#090884" color="white" _hover={{ bg: '#06066e' }} onClick={openAdd}
            fontSize="14px" h="40px" borderRadius="6px" px={5}
            w={{ base: 'full', sm: 'auto' }}>
            <Plus size={16} style={{ marginRight: 6 }} /> नया एडमिन जोड़ें
          </Button>
        )}
      </Flex>

      {/* Desktop Table */}
      <Box display={{ base: 'none', md: 'block' }} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="sm">
            <Table.Header bg="#f8f9fa">
              <Table.Row>
                {['#', 'नाम', 'ईमेल', 'भूमिका', 'स्थिति', 'जोड़ा गया', 'कार्रवाई'].map(h => (
                  <Table.ColumnHeader key={h} px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">{h}</Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} textAlign="center" py={10} color="gray.400">कोई एडमिन नहीं मिला</Table.Cell>
                </Table.Row>
              ) : filtered.map((a, i) => (
                <Table.Row key={a._id} _hover={{ bg: 'gray.50' }}
                  bg={a._id === currentAdmin?._id ? '#f0f0ff' : 'white'}>
                  <Table.Cell px={4} py={3} fontSize="13px" color="gray.500">{i + 1}</Table.Cell>
                  <Table.Cell px={4} py={3}>
                    <HStack gap={2}>
                      <Text fontSize="14px" fontWeight="600" color="gray.700">{a.name}</Text>
                      {a._id === currentAdmin?._id && (
                        <Badge bg="#eeeeff" color="#090884" px={2} fontSize="10px" borderRadius="full">आप</Badge>
                      )}
                    </HStack>
                  </Table.Cell>
                  <Table.Cell px={4} py={3}>
                    <HStack gap={1}>
                      <Mail size={13} color="#999" />
                      <Text fontSize="13px" color="gray.600">{a.email}</Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell px={4} py={3}>
                    <Badge
                      bg={a.role === 'superadmin' ? '#090884' : '#eeeeff'}
                      color={a.role === 'superadmin' ? 'white' : '#090884'}
                      px={2} py={1} borderRadius="full" fontSize="11px">
                      {a.role === 'superadmin' ? 'सुपर एडमिन' : 'एडमिन'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell px={4} py={3}>
                    <Badge bg={a.isActive ? '#eeeeff' : '#f8d7da'} color={a.isActive ? '#090884' : '#721c24'}
                      px={2} py={1} borderRadius="full" fontSize="11px">
                      {a.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell px={4} py={3}>
                    <Text fontSize="12px" color="gray.500">{new Date(a.createdAt).toLocaleDateString('hi-IN')}</Text>
                  </Table.Cell>
                  <Table.Cell px={4} py={3}>
                    {isSuperAdmin && (
                      <HStack gap={2}>
                        <Button size="xs" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                          onClick={() => openEdit(a)} borderRadius="4px" px={3} fontSize="12px">
                          <Pencil size={11} style={{ marginRight: 4 }} /> एडिट
                        </Button>
                        {a._id !== currentAdmin?._id && (
                          <Button size="xs" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                            onClick={() => askDelete(a)} borderRadius="4px" px={3} fontSize="12px">
                            <Trash2 size={11} style={{ marginRight: 4 }} /> डिलीट
                          </Button>
                        )}
                      </HStack>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
        <Box px={4} py={2} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
          <Text fontSize="12px" color="gray.500">कुल {filtered.length} एडमिन</Text>
        </Box>
      </Box>

      {/* Mobile Card View */}
      <Box display={{ base: 'block', md: 'none' }}>
        {filtered.length === 0 ? (
          <Box bg="white" borderRadius="sm" p={8} textAlign="center" boxShadow="sm">
            <Text color="gray.400">कोई एडमिन नहीं मिला</Text>
          </Box>
        ) : (
          <VStack gap={3} align="stretch">
            {filtered.map((a, i) => (
              <Box key={a._id} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
                <Flex bg="#090884" px={4} py={3} justifyContent="space-between" alignItems="center">
                  <HStack gap={2}>
                    <Box bg="rgba(255,255,255,0.2)" borderRadius="full" w="28px" h="28px"
                      display="flex" alignItems="center" justifyContent="center">
                      <Text color="white" fontSize="12px" fontWeight="700">{i + 1}</Text>
                    </Box>
                    <Text color="white" fontSize="15px" fontWeight="700">{a.name}</Text>
                    {a._id === currentAdmin?._id && (
                      <Badge bg="white" color="#090884" px={2} fontSize="10px" borderRadius="full">आप</Badge>
                    )}
                  </HStack>
                  <Badge
                    bg={a.role === 'superadmin' ? 'white' : 'rgba(255,255,255,0.2)'}
                    color={a.role === 'superadmin' ? '#090884' : 'white'}
                    px={2} py={1} borderRadius="full" fontSize="11px">
                    {a.role === 'superadmin' ? 'सुपर एडमिन' : 'एडमिन'}
                  </Badge>
                </Flex>
                <Box px={4} py={3}>
                  <VStack gap={2} align="stretch">
                    <Flex justifyContent="space-between" alignItems="center">
                      <HStack gap={2} color="gray.500"><Mail size={14} /><Text fontSize="12px">ईमेल</Text></HStack>
                      <Text fontSize="13px" color="gray.700">{a.email}</Text>
                    </Flex>
                    <Box h="1px" bg="gray.100" />
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text fontSize="12px" color="gray.500">स्थिति</Text>
                      <Badge bg={a.isActive ? '#eeeeff' : '#f8d7da'} color={a.isActive ? '#090884' : '#721c24'}
                        px={2} py={1} borderRadius="full" fontSize="11px">
                        {a.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                      </Badge>
                    </Flex>
                  </VStack>
                </Box>
                {isSuperAdmin && (
                  <Flex borderTop="1px solid" borderColor="gray.100" px={4} py={2} gap={2} justifyContent="flex-end">
                    <Button size="sm" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                      onClick={() => openEdit(a)} borderRadius="4px" fontSize="13px">
                      <Pencil size={13} style={{ marginRight: 4 }} /> एडिट करें
                    </Button>
                    {a._id !== currentAdmin?._id && (
                      <Button size="sm" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                        onClick={() => askDelete(a)} borderRadius="4px" fontSize="13px">
                        <Trash2 size={13} style={{ marginRight: 4 }} /> डिलीट
                      </Button>
                    )}
                  </Flex>
                )}
              </Box>
            ))}
          </VStack>
        )}
        <Box mt={3}><Text fontSize="12px" color="gray.500">कुल {filtered.length} एडमिन</Text></Box>
      </Box>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? `एडमिन एडिट करें — ${editing.name}` : 'नया एडमिन जोड़ें'}>
        <form onSubmit={handleSave}>
          <VStack gap={4}>
            <FF label="पूरा नाम *">
              <Input placeholder="जैसे: Rahul Admin" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required fontSize="14px" />
            </FF>
            <FF label="ईमेल *">
              <Input placeholder="जैसे: rahul@admin.com" value={form.email} type="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })} required fontSize="14px" />
            </FF>
            <FF label={editing ? 'नया पासवर्ड (खाली छोड़ें अगर बदलना नहीं)' : 'पासवर्ड *'}>
              <Input placeholder="••••••••" value={form.password} type="password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editing} fontSize="14px" />
            </FF>
            <FF label="भूमिका *">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={selectStyle}>
                <option value="admin">एडमिन</option>
                <option value="superadmin">सुपर एडमिन</option>
              </select>
            </FF>
            <Flex gap={3} w="full" pt={2}
              flexDirection={{ base: 'column', sm: 'row' }}
              justifyContent={{ base: 'stretch', sm: 'flex-end' }}>
              <Button onClick={() => setModalOpen(false)} fontSize="14px"
                w={{ base: 'full', sm: 'auto' }} h="40px" borderRadius="6px" px={5}
                bg="gray.100" color="gray.700" _hover={{ bg: 'gray.200' }}>रद्द करें</Button>
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
        title="एडमिन डिलीट"
        message={`क्या आप सच में "${confirmState.name}" को हटाना चाहते हैं? यह कार्रवाई वापस नहीं की जा सकती।`}
        confirmText="हाँ, डिलीट"
        cancelText="नहीं, रहने दें"
      />
    </Box>
  );
};

const FF = ({ label, children }) => (
  <Box w="full"><Text fontSize="13px" color="gray.600" mb={1} fontWeight="500">{label}</Text>{children}</Box>
);

const selectStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
  borderRadius: '4px', fontSize: '14px', outline: 'none', background: 'white',
};

export default Admins;
