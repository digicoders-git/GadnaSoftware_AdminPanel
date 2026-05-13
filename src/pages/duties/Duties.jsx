import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, Input, VStack, HStack, Badge, Table, Spinner, Textarea,
} from '@chakra-ui/react';
import {
  Plus, Pencil, Trash2, UserCheck, UserX, CheckCircle,
  ClipboardList, Search, MapPin, Calendar, User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getDuties, createDuty, updateDuty, deleteDuty,
  assignDuty, removeDutyAssignment, completeDuty, getUnassignedUsers,
} from '../../api/services';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';

const DUTY_TYPES = [
  { value: 'patrol', label: 'गश्त (Patrol)' },
  { value: 'guard', label: 'पहरा (Guard)' },
  { value: 'investigation', label: 'जांच (Investigation)' },
  { value: 'traffic', label: 'यातायात (Traffic)' },
  { value: 'special', label: 'विशेष (Special)' },
  { value: 'other', label: 'अन्य (Other)' },
];

const emptyForm = { title: '', description: '', location: '', dutyType: 'patrol', startDate: '', endDate: '' };

const Duties = () => {
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedDuty, setSelectedDuty] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [assignForm, setAssignForm] = useState({ userId: '', remarks: '' });
  const [remarkText, setRemarkText] = useState('');
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, title: '' });
  const [deleting, setDeleting] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState({ open: false, duty: null });
  const [completeConfirm, setCompleteConfirm] = useState({ open: false, duty: null });

  const fetchDuties = async () => {
    try {
      const { data } = await getDuties();
      setDuties(data);
    } catch {
      toast.error('ड्यूटी लोड करने में समस्या हुई');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDuties(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      title: d.title, description: d.description || '', location: d.location || '',
      dutyType: d.dutyType, startDate: d.startDate?.slice(0, 16) || '', endDate: d.endDate?.slice(0, 16) || '',
    });
    setModalOpen(true);
  };

  const openAssign = async (duty) => {
    setSelectedDuty(duty);
    setAssignForm({ userId: '', remarks: '' });
    try {
      // Backend returns: { totalUsers, totalUnassigned, unassignedUsers: [...] }
      const { data } = await getUnassignedUsers();
      setUnassignedUsers(data.unassignedUsers || []);
    } catch { toast.error('उपलब्ध अधिकारियों की सूची लोड नहीं हुई'); }
    setAssignModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('कृपया ड्यूटी का शीर्षक दर्ज करें');
      return;
    }
    if (!form.startDate) {
      toast.error('कृपया शुरू तारीख चुनें');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateDuty(editing._id, form);
        toast.success(`ड्यूटी "${form.title}" सफलतापूर्वक अपडेट हो गई`);
      } else {
        await createDuty(form);
        toast.success(`नई ड्यूटी "${form.title}" सफलतापूर्वक बनाई गई`);
      }
      setModalOpen(false); fetchDuties();
    } catch (err) { toast.error(err.response?.data?.message || 'कुछ गलत हुआ, दोबारा कोशिश करें'); }
    finally { setSaving(false); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.userId) {
      toast.error('कृपया अधिकारी चुनें');
      return;
    }
    setSaving(true);
    try {
      await assignDuty(selectedDuty._id, assignForm);
      const selectedOfficer = unassignedUsers.find(u => u._id === assignForm.userId);
      if (selectedDuty.assignedTo) {
        toast.success(`ड्यूटी "${selectedDuty.title}" को ${selectedOfficer?.name || 'नए अधिकारी'} को पुनः असाइन किया गया`);
      } else {
        toast.success(`ड्यूटी "${selectedDuty.title}" को ${selectedOfficer?.name || 'अधिकारी'} को सफलतापूर्वक असाइन किया गया`);
      }
      setAssignModal(false); fetchDuties();
    } catch (err) { toast.error(err.response?.data?.message || 'असाइन करने में समस्या हुई'); }
    finally { setSaving(false); }
  };

  const askRemove = (duty) => {
    setRemoveConfirm({ open: true, duty });
    setRemarkText('');
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await removeDutyAssignment(removeConfirm.duty._id, { remarks: remarkText });
      toast.success(`${removeConfirm.duty.assignedTo?.name} को ड्यूटी "${removeConfirm.duty.title}" से हटा दिया गया`);
      setRemoveConfirm({ open: false, duty: null }); fetchDuties();
    } catch (err) { toast.error(err.response?.data?.message || 'हटाने में समस्या हुई'); }
    finally { setSaving(false); }
  };

  const askComplete = (duty) => {
    setCompleteConfirm({ open: true, duty });
    setRemarkText('');
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await completeDuty(completeConfirm.duty._id, { remarks: remarkText });
      toast.success(`ड्यूटी "${completeConfirm.duty.title}" सफलतापूर्वक पूर्ण हो गई`);
      setCompleteConfirm({ open: false, duty: null }); fetchDuties();
    } catch (err) { toast.error(err.response?.data?.message || 'पूर्ण करने में समस्या हुई'); }
    finally { setSaving(false); }
  };

  const askDelete = (d) => {
    setDeleteConfirm({ open: true, id: d._id, title: d.title });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDuty(deleteConfirm.id);
      toast.success(`ड्यूटी "${deleteConfirm.title}" हटा दी गई`);
      setDeleteConfirm({ open: false, id: null, title: '' });
      fetchDuties();
    } catch (err) { toast.error(err.response?.data?.message || 'हटाने में समस्या हुई'); }
    finally { setDeleting(false); }
  };

  const filtered = duties.filter(
    (d) => d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.location?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <Flex h="60vh" alignItems="center" justifyContent="center">
      <VStack><Spinner size="xl" color="#090884" /><Text color="gray.500">लोड हो रहा है...</Text></VStack>
    </Flex>
  );

  return (
    <Box>
      <PageHeader title="ड्यूटी प्रबंधन" subtitle="ड्यूटी बनाएं, असाइन करें और प्रबंधित करें" icon={ClipboardList} />

      <Flex justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={3}>
        <Flex border="1px solid" borderColor="gray.300" borderRadius="4px"
          alignItems="center" px={3} bg="white" w={{ base: 'full', sm: '280px' }}>
          <Search size={15} color="#999" />
          <Input border="none" _focus={{ boxShadow: 'none' }} placeholder="ड्यूटी या स्थान खोजें..."
            value={search} onChange={(e) => setSearch(e.target.value)} fontSize="14px" h="38px" />
        </Flex>
        <Button bg="#090884" color="white" _hover={{ bg: '#06066e' }} onClick={openAdd}
          fontSize="14px" h="40px" borderRadius="6px" px={5}
          w={{ base: 'full', sm: 'auto' }}>
          <Plus size={16} style={{ marginRight: 6 }} /> नई ड्यूटी बनाएं
        </Button>
      </Flex>

      {/* Desktop Table */}
      <Box display={{ base: 'none', lg: 'block' }} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="sm">
            <Table.Header bg="#f8f9fa">
              <Table.Row>
                <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">#</Table.ColumnHeader>
                <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">ड्यूटी</Table.ColumnHeader>
                <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">प्रकार</Table.ColumnHeader>
                <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">स्थान</Table.ColumnHeader>
                <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">असाइन किया</Table.ColumnHeader>
                <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">स्थिति</Table.ColumnHeader>
                <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">कार्रवाई</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} textAlign="center" py={10} color="gray.400">कोई ड्यूटी नहीं मिली</Table.Cell>
                </Table.Row>
              ) : (
                filtered.map((d, i) => (
                  <Table.Row key={d._id} _hover={{ bg: 'gray.50' }}>
                    <Table.Cell px={4} py={3} fontSize="13px" color="gray.500">{i + 1}</Table.Cell>
                    <Table.Cell px={4} py={3}>
                      <Text fontSize="14px" fontWeight="600" color="gray.700">{d.title}</Text>
                      {d.description && <Text fontSize="11px" color="gray.400" noOfLines={1}>{d.description}</Text>}
                    </Table.Cell>
                    <Table.Cell px={4} py={3}>
                      <Badge bg={d.dutyType === 'special' ? '#fff3cd' : '#eeeeff'}
                        color={d.dutyType === 'special' ? '#856404' : '#090884'}
                        px={2} py={1} borderRadius="full" fontSize="11px">
                        {d.dutyType === 'special' && '★ '}{DUTY_TYPES.find(t => t.value === d.dutyType)?.label || d.dutyType}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell px={4} py={3}>
                      <Text fontSize="13px" color="gray.600">{d.location || '—'}</Text>
                    </Table.Cell>
                    <Table.Cell px={4} py={3}>
                      {d.assignedTo
                        ? <Text fontSize="13px" fontWeight="600" color="#090884">{d.assignedTo.name}</Text>
                        : <Text fontSize="12px" color="gray.400">असाइन नहीं</Text>}
                    </Table.Cell>
                    <Table.Cell px={4} py={3}>
                      <Badge bg={statusColor(d.status).bg} color={statusColor(d.status).color}
                        px={2} py={1} borderRadius="full" fontSize="11px">
                        {statusHindi(d.status)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell px={4} py={3}>
                      <ActionButtons d={d} openAssign={openAssign} openEdit={openEdit}
                        askRemove={askRemove} askComplete={askComplete} askDelete={askDelete} />
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Box>
        <Box px={4} py={2} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
          <Text fontSize="12px" color="gray.500">कुल {filtered.length} ड्यूटी</Text>
        </Box>
      </Box>

      {/* Mobile + Tablet Card View */}
      <Box display={{ base: 'block', lg: 'none' }}>
        {filtered.length === 0 ? (
          <Box bg="white" borderRadius="sm" p={8} textAlign="center" boxShadow="sm">
            <Text color="gray.400">कोई ड्यूटी नहीं मिली</Text>
          </Box>
        ) : (
          <VStack gap={3} align="stretch">
            {filtered.map((d, i) => (
              <Box key={d._id} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
                {/* Blue Header */}
                <Flex bg={d.dutyType === 'special' ? '#856404' : d.status === 'cancelled' ? '#fe0808' : '#090884'}
                  px={4} py={3} justifyContent="space-between" alignItems="flex-start">
                  <HStack gap={2} flex={1} mr={2}>
                    <Box bg="rgba(255,255,255,0.2)" borderRadius="full" w="26px" h="26px" flexShrink={0}
                      display="flex" alignItems="center" justifyContent="center">
                      <Text color="white" fontSize="11px" fontWeight="700">{i + 1}</Text>
                    </Box>
                    <Box minW={0}>
                      <HStack gap={2}>
                        <Text color="white" fontSize="14px" fontWeight="700" noOfLines={1}>{d.title}</Text>
                        {d.dutyType === 'special' && (
                          <Badge bg="rgba(255,215,0,0.3)" color="#FFD700"
                            px={2} borderRadius="full" fontSize="9px" fontWeight="700" flexShrink={0}>
                            ★ SPECIAL
                          </Badge>
                        )}
                      </HStack>
                      {d.description && <Text color="rgba(255,255,255,0.6)" fontSize="11px" noOfLines={1}>{d.description}</Text>}
                    </Box>
                  </HStack>
                  <Badge bg="rgba(255,255,255,0.2)" color="white"
                    px={2} py={1} borderRadius="full" fontSize="10px" flexShrink={0}>
                    {statusHindi(d.status)}
                  </Badge>
                </Flex>

                {/* Card Details */}
                <Box px={4} py={3}>
                  <VStack gap={2} align="stretch">
                    <Flex justifyContent="space-between" alignItems="center">
                      <HStack gap={2} color="gray.500">
                        <ClipboardList size={13} />
                        <Text fontSize="12px">ड्यूटी प्रकार</Text>
                      </HStack>
                      <Badge bg="#eeeeff" color="#090884" px={2} py={0.5} borderRadius="full" fontSize="11px">
                        {DUTY_TYPES.find(t => t.value === d.dutyType)?.label || d.dutyType}
                      </Badge>
                    </Flex>
                    {d.location && (
                      <>
                        <Box h="1px" bg="gray.100" />
                        <Flex justifyContent="space-between" alignItems="center">
                          <HStack gap={2} color="gray.500"><MapPin size={13} /><Text fontSize="12px">स्थान</Text></HStack>
                          <Text fontSize="13px" color="gray.700" fontWeight="500">{d.location}</Text>
                        </Flex>
                      </>
                    )}
                    <Box h="1px" bg="gray.100" />
                    <Flex justifyContent="space-between" alignItems="center">
                      <HStack gap={2} color="gray.500"><User size={13} /><Text fontSize="12px">असाइन किया</Text></HStack>
                      {d.assignedTo
                        ? <Text fontSize="13px" fontWeight="700" color="#090884">{d.assignedTo.name}</Text>
                        : <Text fontSize="12px" color="gray.400" fontStyle="italic">असाइन नहीं</Text>}
                    </Flex>
                    {d.startDate && (
                      <>
                        <Box h="1px" bg="gray.100" />
                        <Flex justifyContent="space-between" alignItems="center">
                          <HStack gap={2} color="gray.500"><Calendar size={13} /><Text fontSize="12px">शुरू तारीख</Text></HStack>
                          <Text fontSize="12px" color="gray.600">{new Date(d.startDate).toLocaleDateString('hi-IN')}</Text>
                        </Flex>
                      </>
                    )}
                  </VStack>
                </Box>

                {/* Action Buttons */}
                <Box px={4} py={3} borderTop="1px solid" borderColor="gray.100">
                  <VStack gap={2}>
                    {/* Special duty - assign blocked */}
                    {d.dutyType === 'special' && d.status === 'active' && d.assignedTo && (
                      <Box w="full" bg="#fff3cd" border="1px solid #856404" borderRadius="6px" px={3} py={2}>
                        <Text fontSize="12px" color="#856404" fontWeight="600">
                          ★ प्रतिनियुक्त — पुनः असाइन नहीं हो सकता
                        </Text>
                        <Text fontSize="11px" color="#856404">
                          पहले इस विशेष ड्यूटी को समाप्त करें
                        </Text>
                      </Box>
                    )}
                    {/* Normal assign button - only for non-special or unassigned */}
                    {(d.status === 'pending' || (d.status === 'active' && d.dutyType !== 'special')) && (
                      <Button w="full" size="sm" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                        onClick={() => openAssign(d)} borderRadius="6px" fontSize="13px" h="38px">
                        <UserCheck size={14} style={{ marginRight: 6 }} />
                        {d.assignedTo ? 'पुनः असाइन करें' : 'असाइन करें'}
                      </Button>
                    )}
                    {d.status === 'active' && d.assignedTo && (
                      <Flex gap={2} w="full">
                        <Button flex={1} size="sm" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                          onClick={() => askRemove(d)} borderRadius="6px" fontSize="13px" h="38px">
                          <UserX size={13} style={{ marginRight: 5 }} /> हटाएं
                        </Button>
                        <Button flex={1} size="sm" bg="#22c55e" color="white" _hover={{ bg: '#16a34a' }}
                          onClick={() => askComplete(d)} borderRadius="6px" fontSize="13px" h="38px">
                          <CheckCircle size={13} style={{ marginRight: 5 }} /> पूर्ण करें
                        </Button>
                      </Flex>
                    )}
                    {(d.status === 'pending' || d.status === 'completed' || d.status === 'cancelled') && (
                      <Flex gap={2} w="full">
                        {d.status === 'pending' && (
                          <Button flex={1} size="sm" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                            onClick={() => openEdit(d)} borderRadius="6px" fontSize="13px" h="38px">
                            <Pencil size={13} style={{ marginRight: 5 }} /> संपादित
                          </Button>
                        )}
                        <Button flex={1} size="sm" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                          onClick={() => askDelete(d)} borderRadius="6px" fontSize="13px" h="38px">
                          <Trash2 size={13} style={{ marginRight: 5 }} /> हटाएं
                        </Button>
                      </Flex>
                    )}
                  </VStack>
                </Box>
              </Box>
            ))}
          </VStack>
        )}
        <Box mt={3} px={1}>
          <Text fontSize="12px" color="gray.500">कुल {filtered.length} ड्यूटी</Text>
        </Box>
      </Box>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'ड्यूटी संपादित करें' : 'नई ड्यूटी बनाएं'}>
        <form onSubmit={handleSave}>
          <VStack gap={4}>
            <FF label="ड्यूटी का शीर्षक *">
              <Input placeholder="जैसे: रात्रि गश्त" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} required fontSize="14px" />
            </FF>
            <FF label="विवरण">
              <Textarea placeholder="ड्यूटी का विवरण..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} fontSize="14px" rows={2} />
            </FF>
            <FF label="स्थान">
              <Input placeholder="जैसे: सेक्टर 12" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} fontSize="14px" />
            </FF>
            <FF label="ड्यूटी प्रकार *">
              <select value={form.dutyType} onChange={(e) => setForm({ ...form, dutyType: e.target.value })}
                style={selectStyle}>
                {DUTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FF>
            <FF label="शुरू तारीख *">
              <Input type="datetime-local" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} required fontSize="14px" />
            </FF>
            <FF label="समाप्ति तारीख">
              <Input type="datetime-local" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} fontSize="14px" />
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
                {editing ? 'अपडेट करें' : 'बनाएं'}
              </Button>
            </Flex>
          </VStack>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="ड्यूटी असाइन करें">
        <form onSubmit={handleAssign}>
          <VStack gap={4}>
            <Box w="full" p={3} bg="gray.50" borderRadius="sm" borderLeft="3px solid #090884">
              <Text fontSize="12px" color="gray.500">ड्यूटी:</Text>
              <Text fontSize="14px" fontWeight="700" color="gray.700">{selectedDuty?.title}</Text>
              {selectedDuty?.location && (
                <Text fontSize="12px" color="gray.500">📍 {selectedDuty.location}</Text>
              )}
              {selectedDuty?.assignedTo && (
                <Text fontSize="12px" color="orange.500" mt={1}>
                  ⚠️ वर्तमान में: {selectedDuty.assignedTo.name} — पुनः असाइन होगा
                </Text>
              )}
            </Box>
            <FF label="अधिकारी चुनें *">
              <select value={assignForm.userId}
                onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                required style={selectStyle}>
                <option value="">-- उपलब्ध अधिकारी चुनें --</option>
                {unassignedUsers.map(u => (
                  <option key={u._id} value={u._id}>{u.name} — {u.pnoNumber} ({u.designation?.name})</option>
                ))}
              </select>
            </FF>
            <FF label="टिप्पणी">
              <Input placeholder="असाइनमेंट की टिप्पणी..." value={assignForm.remarks}
                onChange={(e) => setAssignForm({ ...assignForm, remarks: e.target.value })} fontSize="14px" />
            </FF>
            <Flex gap={3} w="full" pt={2}
              flexDirection={{ base: 'column', sm: 'row' }}
              justifyContent={{ base: 'stretch', sm: 'flex-end' }}>
              <Button onClick={() => setAssignModal(false)} fontSize="14px"
                w={{ base: 'full', sm: 'auto' }} h="40px" borderRadius="6px" px={5}
                bg="gray.100" color="gray.700" _hover={{ bg: 'gray.200' }}>रद्द करें</Button>
              <Button type="submit" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                loading={saving} loadingText="असाइन हो रहा है..." fontSize="14px"
                w={{ base: 'full', sm: 'auto' }} h="40px" borderRadius="6px" px={5}>
                असाइन करें
              </Button>
            </Flex>
          </VStack>
        </form>
      </Modal>

      {/* Remove Assignment Confirm */}
      <ConfirmDialog
        isOpen={removeConfirm.open}
        onClose={() => setRemoveConfirm({ open: false, duty: null })}
        onConfirm={handleRemove}
        loading={saving}
        type="warning"
        title="असाइनमेंट हटाएं"
        message={`क्या आप सच में "${removeConfirm.duty?.assignedTo?.name}" को ड्यूटी "${removeConfirm.duty?.title}" से हटाना चाहते हैं? अधिकारी को ड्यूटी से मुक्त कर दिया जाएगा।`}
        confirmText="हाँ, हटाएं"
        cancelText="नहीं, रहने दें"
      />

      {/* Complete Duty Confirm */}
      <ConfirmDialog
        isOpen={completeConfirm.open}
        onClose={() => setCompleteConfirm({ open: false, duty: null })}
        onConfirm={handleComplete}
        loading={saving}
        type="success"
        title="ड्यूटी पूर्ण करें"
        message={`क्या आप पुष्टि करते हैं कि ड्यूटी "${completeConfirm.duty?.title}" पूर्ण हो गई है? अधिकारी "${completeConfirm.duty?.assignedTo?.name}" की ड्यूटी समाप्त हो जाएगी।`}
        confirmText="हाँ, पूर्ण करें"
        cancelText="नहीं, रहने दें"
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, title: '' })}
        onConfirm={handleDelete}
        loading={deleting}
        type="danger"
        title="ड्यूटी हटाएं"
        message={`क्या आप सच में "${deleteConfirm.title}" ड्यूटी को हटाना चाहते हैं? यह कार्रवाई वापस नहीं की जा सकती।`}
        confirmText="हाँ, हटाएं"
        cancelText="नहीं, रहने दें"
      />
    </Box>
  );
};

const ActionButtons = ({ d, openAssign, openEdit, askRemove, askComplete, askDelete }) => (
  <HStack gap={1} flexWrap="wrap">
    {/* Special active duty - assign blocked */}
    {d.dutyType === 'special' && d.status === 'active' && d.assignedTo ? (
      <Badge bg="#fff3cd" color="#856404" px={2} py={1} borderRadius="4px" fontSize="10px">
        ★ प्रतिनियुक्त
      </Badge>
    ) : (
      (d.status === 'pending' || d.status === 'active') && (
        <Button size="xs" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
          onClick={() => openAssign(d)} borderRadius="4px" px={2} fontSize="11px">
          <UserCheck size={11} style={{ marginRight: 3 }} />
          {d.assignedTo ? 'पुनः' : 'असाइन'}
        </Button>
      )
    )}
    {d.status === 'active' && d.assignedTo && (
      <>
        <Button size="xs" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
          onClick={() => askRemove(d)} borderRadius="4px" px={2} fontSize="11px">
          <UserX size={11} style={{ marginRight: 3 }} /> हटाएं
        </Button>
        <Button size="xs" bg="#22c55e" color="white" _hover={{ bg: '#16a34a' }}
          onClick={() => askComplete(d)} borderRadius="4px" px={2} fontSize="11px">
          <CheckCircle size={11} style={{ marginRight: 3 }} /> पूर्ण
        </Button>
      </>
    )}
    {d.status === 'pending' && (
      <Button size="xs" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
        onClick={() => openEdit(d)} borderRadius="4px" px={2} fontSize="11px">
        <Pencil size={11} style={{ marginRight: 3 }} /> संपादित
      </Button>
    )}
    {d.status !== 'active' && (
      <Button size="xs" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
        onClick={() => askDelete(d)} borderRadius="4px" px={2} fontSize="11px">
        <Trash2 size={11} style={{ marginRight: 3 }} /> हटाएं
      </Button>
    )}
  </HStack>
);

const FF = ({ label, children }) => (
  <Box w="full">
    <Text fontSize="13px" color="gray.600" mb={1} fontWeight="500">{label}</Text>
    {children}
  </Box>
);

const selectStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
  borderRadius: '4px', fontSize: '14px', outline: 'none', background: 'white',
};

const statusHindi = (s) => ({ pending: 'प्रतीक्षित', active: 'सक्रिय', completed: 'पूर्ण', cancelled: 'रद्द' }[s] || s);
const statusColor = (s) => ({
  pending: { bg: '#fff3cd', color: '#856404' },
  active: { bg: '#eeeeff', color: '#090884' },
  completed: { bg: '#eeeeff', color: '#090884' },
  cancelled: { bg: '#ffe5e5', color: '#fe0808' },
}[s] || { bg: 'gray.100', color: 'gray.600' });

export default Duties;


