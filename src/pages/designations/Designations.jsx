import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, Input, VStack, HStack, Badge, Table, Spinner,
} from '@chakra-ui/react';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDesignations, createDesignation, updateDesignation, deleteDesignation } from '../../api/services';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';

const Designations = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await getDesignations(true);
      setList(data);
    } catch {
      toast.error('डेटा लोड करने में समस्या हुई');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', isActive: true }); setModalOpen(true); };
  const openEdit = (d) => { setEditing(d); setForm({ name: d.name, isActive: d.isActive }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('कृपया पदनाम का नाम दर्ज करें'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateDesignation(editing._id, form);
        toast.success(`पदनाम "${form.name}" सफलतापूर्वक अपडेट हो गया`);
      } else {
        await createDesignation({ name: form.name });
        toast.success(`नया पदनाम "${form.name}" सफलतापूर्वक जोड़ा गया`);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'कुछ गलत हुआ, दोबारा कोशिश करें');
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (d) => setConfirmState({ open: true, id: d._id, name: d.name });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDesignation(confirmState.id);
      toast.success(`पदनाम "${confirmState.name}" हटा दिया गया`);
      setConfirmState({ open: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'हटाने में समस्या हुई');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <Flex h="60vh" alignItems="center" justifyContent="center">
      <VStack><Spinner size="xl" color="#090884" /><Text color="gray.500">लोड हो रहा है...</Text></VStack>
    </Flex>
  );

  return (
    <Box>
      <PageHeader title="पदनाम प्रबंधन" subtitle="अधिकारियों के पदनाम प्रबंधित करें" icon={Layers} />

      <Flex justifyContent="flex-end" mb={4}>
        <Button bg="#090884" color="white" _hover={{ bg: '#06066e' }} onClick={openAdd}
          fontSize="14px" h="40px" borderRadius="6px" px={5}
          w={{ base: 'full', sm: 'auto' }}>
          <Plus size={16} style={{ marginRight: 6 }} /> नया पदनाम जोड़ें
        </Button>
      </Flex>

      {/* Desktop Table */}
      <Box display={{ base: 'none', md: 'block' }} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
        <Table.Root size="sm">
          <Table.Header bg="#f8f9fa">
            <Table.Row>
              {['#', 'पदनाम का नाम', 'स्थिति', 'जोड़ा गया', 'कार्रवाई'].map(h => (
                <Table.ColumnHeader key={h} px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">{h}</Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {list.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} textAlign="center" py={10} color="gray.400">कोई पदनाम नहीं मिला</Table.Cell>
              </Table.Row>
            ) : list.map((d, i) => (
              <Table.Row key={d._id} _hover={{ bg: 'gray.50' }}>
                <Table.Cell px={4} py={3} fontSize="13px" color="gray.500">{i + 1}</Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Text fontSize="14px" fontWeight="600" color="gray.700">{d.name}</Text>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Badge bg={d.isActive ? '#eeeeff' : '#f8d7da'} color={d.isActive ? '#090884' : '#721c24'}
                    px={2} py={1} borderRadius="full" fontSize="11px">
                    {d.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                  </Badge>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Text fontSize="12px" color="gray.500">{new Date(d.createdAt).toLocaleDateString('hi-IN')}</Text>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <HStack gap={2}>
                    <Button size="xs" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                      onClick={() => openEdit(d)} borderRadius="4px" px={3} fontSize="12px">
                      <Pencil size={11} style={{ marginRight: 4 }} /> एडिट
                    </Button>
                    <Button size="xs" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                      onClick={() => askDelete(d)} borderRadius="4px" px={3} fontSize="12px">
                      <Trash2 size={11} style={{ marginRight: 4 }} /> डिलीट
                    </Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Box px={4} py={2} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
          <Text fontSize="12px" color="gray.500">कुल {list.length} पदनाम</Text>
        </Box>
      </Box>

      {/* Mobile Card View */}
      <Box display={{ base: 'block', md: 'none' }}>
        {list.length === 0 ? (
          <Box bg="white" borderRadius="sm" p={8} textAlign="center" boxShadow="sm">
            <Text color="gray.400">कोई पदनाम नहीं मिला</Text>
          </Box>
        ) : (
          <VStack gap={3} align="stretch">
            {list.map((d, i) => (
              <Box key={d._id} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
                {/* Blue Header */}
                <Flex bg="#090884" px={4} py={3} justifyContent="space-between" alignItems="center">
                  <HStack gap={2}>
                    <Box bg="rgba(255,255,255,0.2)" borderRadius="full" w="28px" h="28px"
                      display="flex" alignItems="center" justifyContent="center">
                      <Text color="white" fontSize="12px" fontWeight="700">{i + 1}</Text>
                    </Box>
                    <Box>
                      <Text color="white" fontSize="15px" fontWeight="700">{d.name}</Text>
                      <Text color="rgba(255,255,255,0.6)" fontSize="11px">
                        {new Date(d.createdAt).toLocaleDateString('hi-IN')} को जोड़ा गया
                      </Text>
                    </Box>
                  </HStack>
                  <Badge bg={d.isActive ? '#22c55e' : '#fe0808'} color="white"
                    px={2} py={1} borderRadius="full" fontSize="11px">
                    {d.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                  </Badge>
                </Flex>
                {/* Buttons */}
                <Box px={4} py={3}>
                  <Flex gap={2}>
                    <Button flex={1} size="sm" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                      onClick={() => openEdit(d)} borderRadius="6px" fontSize="13px" h="38px">
                      <Pencil size={13} style={{ marginRight: 5 }} /> एडिट करें
                    </Button>
                    <Button flex={1} size="sm" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                      onClick={() => askDelete(d)} borderRadius="6px" fontSize="13px" h="38px">
                      <Trash2 size={13} style={{ marginRight: 5 }} /> डिलीट
                    </Button>
                  </Flex>
                </Box>
              </Box>
            ))}
          </VStack>
        )}
        <Box mt={3}><Text fontSize="12px" color="gray.500">कुल {list.length} पदनाम</Text></Box>
      </Box>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? `पदनाम एडिट करें — ${editing.name}` : 'नया पदनाम जोड़ें'}>
        <form onSubmit={handleSave}>
          <VStack gap={4}>
            <Box w="full">
              <Text fontSize="13px" color="gray.600" mb={1} fontWeight="500">पदनाम का नाम *</Text>
              <Input placeholder="जैसे: Sub Inspector" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required
                fontSize="14px" h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </Box>
            {editing && (
              <Box w="full">
                <Text fontSize="13px" color="gray.600" mb={1} fontWeight="500">स्थिति</Text>
                <select value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                  style={{ width: '100%', height: '48px', padding: '0 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: '#f7f8fa', outline: 'none' }}>
                  <option value="true">सक्रिय</option>
                  <option value="false">निष्क्रिय</option>
                </select>
              </Box>
            )}
            <Flex gap={3} w="full" pt={2}
              flexDirection={{ base: 'column', sm: 'row' }}
              justifyContent={{ base: 'stretch', sm: 'flex-end' }}>
              <Button onClick={() => setModalOpen(false)} fontSize="14px"
                w={{ base: 'full', sm: 'auto' }} h="40px" borderRadius="6px" px={5}
                bg="gray.100" color="gray.700" _hover={{ bg: 'gray.200' }}>रद्द करें</Button>
              <Button type="submit" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                loading={saving} loadingText="सहेजा जा रहा है..." fontSize="14px"
                w={{ base: 'full', sm: 'auto' }} h="40px">
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
        title="पदनाम डिलीट"
        message={`क्या आप सच में "${confirmState.name}" पदनाम को हटाना चाहते हैं? इस पदनाम से जुड़े अधिकारी प्रभावित हो सकते हैं।`}
        confirmText="हाँ, डिलीट"
        cancelText="नहीं, रहने दें"
      />
    </Box>
  );
};

export default Designations;
