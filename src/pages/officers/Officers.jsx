import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, Input, VStack, HStack, Badge, Table, Spinner, Textarea,
} from '@chakra-ui/react';
import { UserPlus, Pencil, Trash2, Users, Search, Phone, Hash, Award, History, ClipboardList, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getUsers, createUser, updateUser, deleteUser, getDesignations, getUserStatusOverview, getDuties, assignDuty, createHoliday } from '../../api/services';
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

const Officers = () => {
  const [users, setUsers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', designation: '', phoneNumber: '', pnoNumber: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);

  const [dutyAssignModal, setDutyAssignModal] = useState(false);
  const [holidayAssignModal, setHolidayAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [duties, setDuties] = useState([]);
  const [dutyForm, setDutyForm] = useState({ dutyId: '', dutyType: 'patrol', startDate: '', endDate: '', remarks: '' });
  const [holidayForm, setHolidayForm] = useState({ startDate: '', endDate: '', reason: '', remarks: '' });

  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      const [uRes, dRes, ovRes, dutiesRes] = await Promise.all([getUsers(true), getDesignations(), getUserStatusOverview(), getDuties()]);
      setUsers(uRes.data);
      setDesignations(dRes.data);
      setDuties(dutiesRes.data);
      const map = {};
      const ov = ovRes.data;
      (ov.available || []).forEach(u => { map[u._id] = { status: 'available' }; });
      (ov.dutyWise || []).forEach(g => g.users.forEach(item => {
        map[item.user._id] = { status: 'onDuty', duty: item.duty };
      }));
      (ov.deputed || []).forEach(item => {
        map[item.user._id] = { status: 'deputed', duty: item.duty };
      });
      (ov.onHoliday || []).forEach(item => {
        map[item.user._id] = { status: 'onHoliday', holiday: item.holiday };
      });
      setStatusMap(map);
    } catch (err) {
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

  const openDutyAssign = (user) => {
    setSelectedUser(user);
    setDutyForm({ dutyId: '', dutyType: 'patrol', startDate: '', endDate: '', remarks: '' });
    setDutyAssignModal(true);
  };

  const handleDutyAssign = async (e) => {
    e.preventDefault();
    if (!dutyForm.dutyId) { toast.error('कृपया ड्यूटी चुनें'); return; }
    if (!dutyForm.startDate) { toast.error('कृपया शुरू तारीख चुनें'); return; }
    setSaving(true);
    try {
      await assignDuty(dutyForm.dutyId, {
        userId: selectedUser._id,
        dutyType: dutyForm.dutyType,
        startDate: dutyForm.startDate,
        endDate: dutyForm.endDate || undefined,
        remarks: dutyForm.remarks,
      });
      toast.success(`${selectedUser.name} को ड्यूटी असाइन कर दी गई`);
      setDutyAssignModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'ड्यूटी असाइन करने में समस्या हुई');
    } finally {
      setSaving(false);
    }
  };

  const openHolidayAssign = (user) => {
    setSelectedUser(user);
    setHolidayForm({ startDate: '', endDate: '', reason: '', remarks: '' });
    setHolidayAssignModal(true);
  };

  const handleHolidayAssign = async (e) => {
    e.preventDefault();
    if (!holidayForm.startDate) { toast.error('कृपया शुरू तारीख चुनें'); return; }
    if (!holidayForm.endDate) { toast.error('कृपया समाप्ति तारीख चुनें'); return; }
    if (!holidayForm.reason.trim()) { toast.error('कृपया छुट्टी का कारण दर्ज करें'); return; }
    setSaving(true);
    try {
      await createHoliday({
        userId: selectedUser._id,
        startDate: holidayForm.startDate,
        endDate: holidayForm.endDate,
        reason: holidayForm.reason,
        remarks: holidayForm.remarks,
      });
      toast.success(`${selectedUser.name} को छुट्टी असाइन कर दी गई`);
      setHolidayAssignModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'छुट्टी असाइन करने में समस्या हुई');
    } finally {
      setSaving(false);
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
                {['#', 'नाम', 'पदनाम', 'PNO नंबर', 'फोन नंबर', 'ड्यूटी स्थिति', 'सक्रिय', 'कार्रवाई'].map(h => (
                  <Table.ColumnHeader key={h} px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">{h}</Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} textAlign="center" py={10} color="gray.400">कोई अधिकारी नहीं मिला</Table.Cell>
                </Table.Row>
              ) : filtered.map((u, i) => {
                const st = statusMap[u._id];
                return (
                <Table.Row key={u._id} _hover={{ bg: 'gray.50' }}>
                  <Table.Cell px={4} py={3} fontSize="13px" color="gray.500">{i + 1}</Table.Cell>
                  <Table.Cell px={4} py={3}><Text fontSize="14px" fontWeight="600" color="gray.700">{u.name}</Text></Table.Cell>
                  <Table.Cell px={4} py={3}><Text fontSize="13px" color="gray.600">{u.designation?.name || '—'}</Text></Table.Cell>
                  <Table.Cell px={4} py={3}><Text fontSize="13px" fontFamily="monospace" color="#090884" fontWeight="600">{u.pnoNumber}</Text></Table.Cell>
                  <Table.Cell px={4} py={3}><Text fontSize="13px" color="gray.600">{u.phoneNumber}</Text></Table.Cell>
                  <Table.Cell px={4} py={3}>
                    <DutyStatusCell st={st} navigate={navigate} onDutyAssign={() => openDutyAssign(u)} onHolidayAssign={() => openHolidayAssign(u)} />
                  </Table.Cell>
                  <Table.Cell px={4} py={3}>
                    <Badge bg={u.isActive ? '#eeeeff' : '#f8d7da'} color={u.isActive ? '#090884' : '#721c24'}
                      px={2} py={1} borderRadius="full" fontSize="11px">
                      {u.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell px={4} py={3}>
                    <HStack gap={2}>
                      <ToggleSwitch isActive={u.isActive} onChange={() => handleToggleStatus(u)} />
                      <Button size="xs" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                        onClick={() => openEdit(u)} borderRadius="4px" px={3} fontSize="12px">
                        <Pencil size={11} style={{ marginRight: 4 }} /> एडिट
                      </Button>
                      <Button size="xs" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                        onClick={() => askDelete(u)} borderRadius="4px" px={3} fontSize="12px">
                        <Trash2 size={11} style={{ marginRight: 4 }} /> डिलीट
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
                );
              })}
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
            {filtered.map((u, i) => {
              const st = statusMap[u._id];
              return (
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
                    <Badge bg={u.isActive ? '#eeeeff' : '#f8d7da'} color={u.isActive ? '#090884' : '#721c24'}
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
                    <Box h="1px" bg="gray.100" />
                    <Box>
                      <HStack gap={2} color="gray.500" mb={2}>
                        <ClipboardList size={14} />
                        <Text fontSize="12px" fontWeight="600">ड्यूटी स्थिति</Text>
                      </HStack>
                      <Box pl={1}>
                        <DutyStatusCell st={st} navigate={navigate} compact onDutyAssign={() => openDutyAssign(u)} onHolidayAssign={() => openHolidayAssign(u)} />
                      </Box>
                    </Box>
                  </VStack>
                </Box>
                <Box borderTop="1px solid" borderColor="gray.100" px={4} py={3}>
                  <Flex gap={2} w="full">
                    <Button flex={1} size="sm" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                      onClick={() => openEdit(u)} borderRadius="6px" fontSize="13px" h="36px">
                      <Pencil size={13} style={{ marginRight: 5 }} /> एडिट
                    </Button>
                    <Button flex={1} size="sm" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                      onClick={() => askDelete(u)} borderRadius="6px" fontSize="13px" h="36px">
                      <Trash2 size={13} style={{ marginRight: 5 }} /> डिलीट
                    </Button>
                  </Flex>
                </Box>
              </Box>
              );
            })}
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
        title={editing ? `अधिकारी एडिट करें — ${editing.name}` : 'नया अधिकारी जोड़ें'}>
        <form onSubmit={handleSave}>
          <VStack gap={4}>
            <FF label="पूरा नाम *">
              <Input placeholder="जैसे: रमेश कुमार" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required
                fontSize="14px" h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
            <FF label="पदनाम *">
              <select value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
                required style={{ width: '100%', height: '48px', padding: '0 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#f7f8fa' }}>
                <option value="">-- पदनाम चुनें --</option>
                {designations.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </FF>
            <FF label="PNO नंबर *">
              <Input placeholder="जैसे: PNO001" value={form.pnoNumber}
                onChange={(e) => setForm({ ...form, pnoNumber: e.target.value })} required
                fontSize="14px" h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
            <FF label="फोन नंबर *">
              <Input placeholder="जैसे: 9876543210" value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required
                fontSize="14px" h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
            {editing && (
              <FF label="स्थिति">
                <select value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                  style={{ width: '100%', height: '48px', padding: '0 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#f7f8fa' }}>
                  <option value="true">सक्रिय</option>
                  <option value="false">निष्क्रिय</option>
                </select>
              </FF>
            )}
            <Flex gap={3} w="full" pt={2}
              flexDirection={{ base: 'column', sm: 'row' }}
              justifyContent={{ base: 'stretch', sm: 'flex-end' }}>
              <Button onClick={() => setModalOpen(false)} fontSize="14px"
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
        title="अधिकारी डिलीट"
        message={`क्या आप सच में "${confirmState.name}" को हटाना चाहते हैं? यह कार्रवाई वापस नहीं की जा सकती।`}
        confirmText="हाँ, डिलीट"
        cancelText="नहीं, रहने दें"
      />

      {/* Duty Assign Modal */}
      <Modal isOpen={dutyAssignModal} onClose={() => setDutyAssignModal(false)}
        title={`ड्यूटी असाइन करें — ${selectedUser?.name}`}>
        <form onSubmit={handleDutyAssign}>
          <VStack gap={4}>
            <FF label="ड्यूटी चुनें *">
              <select value={dutyForm.dutyId} onChange={(e) => setDutyForm({ ...dutyForm, dutyId: e.target.value })}
                required style={{ width: '100%', height: '48px', padding: '0 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#f7f8fa' }}>
                <option value="">-- ड्यूटी चुनें --</option>
                {duties.map((d) => <option key={d._id} value={d._id}>{d.title} {d.location ? `(${d.location})` : ''}</option>)}
              </select>
            </FF>
            <FF label="ड्यूटी प्रकार *">
              <select value={dutyForm.dutyType} onChange={(e) => setDutyForm({ ...dutyForm, dutyType: e.target.value })}
                required style={{ width: '100%', height: '48px', padding: '0 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#f7f8fa' }}>
                {DUTY_TYPES.map((dt) => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
              </select>
            </FF>
            <FF label="शुरू तारीख *">
              <Input type="date" value={dutyForm.startDate}
                onChange={(e) => setDutyForm({ ...dutyForm, startDate: e.target.value })} required
                fontSize="14px" h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
            <FF label="समाप्ति तारीख">
              <Input type="date" value={dutyForm.endDate}
                onChange={(e) => setDutyForm({ ...dutyForm, endDate: e.target.value })}
                fontSize="14px" h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
            <FF label="टिप्पणी">
              <Textarea placeholder="कोई विशेष निर्देश..." value={dutyForm.remarks}
                onChange={(e) => setDutyForm({ ...dutyForm, remarks: e.target.value })}
                fontSize="14px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4} py={3} rows={3}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
            <Flex gap={3} w="full" pt={2}
              flexDirection={{ base: 'column', sm: 'row' }}
              justifyContent={{ base: 'stretch', sm: 'flex-end' }}>
              <Button onClick={() => setDutyAssignModal(false)} fontSize="14px"
                w={{ base: 'full', sm: 'auto' }} h="40px" borderRadius="6px" px={5}
                bg="gray.100" color="gray.700" _hover={{ bg: 'gray.200' }}>
                रद्द करें
              </Button>
              <Button type="submit" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                loading={saving} loadingText="असाइन हो रहा है..." fontSize="14px"
                w={{ base: 'full', sm: 'auto' }} h="40px" borderRadius="6px" px={5}>
                असाइन करें
              </Button>
            </Flex>
          </VStack>
        </form>
      </Modal>

      {/* Holiday Assign Modal */}
      <Modal isOpen={holidayAssignModal} onClose={() => setHolidayAssignModal(false)}
        title={`छुट्टी असाइन करें — ${selectedUser?.name}`}>
        <form onSubmit={handleHolidayAssign}>
          <VStack gap={4}>
            <FF label="शुरू तारीख *">
              <Input type="date" value={holidayForm.startDate}
                onChange={(e) => setHolidayForm({ ...holidayForm, startDate: e.target.value })} required
                fontSize="14px" h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
            <FF label="समाप्ति तारीख *">
              <Input type="date" value={holidayForm.endDate}
                onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })} required
                fontSize="14px" h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
            <FF label="छुट्टी का कारण *">
              <Input placeholder="जैसे: बीमारी, व्यक्तिगत कार्य..." value={holidayForm.reason}
                onChange={(e) => setHolidayForm({ ...holidayForm, reason: e.target.value })} required
                fontSize="14px" h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
            <FF label="टिप्पणी">
              <Textarea placeholder="अतिरिक्त जानकारी..." value={holidayForm.remarks}
                onChange={(e) => setHolidayForm({ ...holidayForm, remarks: e.target.value })}
                fontSize="14px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4} py={3} rows={3}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
            <Flex gap={3} w="full" pt={2}
              flexDirection={{ base: 'column', sm: 'row' }}
              justifyContent={{ base: 'stretch', sm: 'flex-end' }}>
              <Button onClick={() => setHolidayAssignModal(false)} fontSize="14px"
                w={{ base: 'full', sm: 'auto' }} h="40px" borderRadius="6px" px={5}
                bg="gray.100" color="gray.700" _hover={{ bg: 'gray.200' }}>
                रद्द करें
              </Button>
              <Button type="submit" bg="#22c55e" color="white" _hover={{ bg: '#16a34a' }}
                loading={saving} loadingText="असाइन हो रहा है..." fontSize="14px"
                w={{ base: 'full', sm: 'auto' }} h="40px" borderRadius="6px" px={5}>
                असाइन करें
              </Button>
            </Flex>
          </VStack>
        </form>
      </Modal>
    </Box>
  );
};

const DUTY_TYPE_LABELS = {
  patrol: 'गश्त',
  guard: 'गार्ड',
  investigation: 'जांच',
  traffic: 'यातायात',
  special: 'विशेष',
  other: 'अन्य',
};

const DutyStatusCell = ({ st, navigate, compact = false, onDutyAssign, onHolidayAssign }) => {
  if (st && st.status === 'available') {
    st.onDutyAssign = onDutyAssign;
    st.onHolidayAssign = onHolidayAssign;
  }
  if (!st) return (
    <Badge bg="gray.100" color="gray.500" px={2} py={1} borderRadius="full" fontSize="11px">—</Badge>
  );

  if (st.status === 'available') return (
    <VStack align="flex-start" gap={2} w="full">
      <Badge bg="#dcfce7" color="#166534" px={2} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
        ✔ उपलब्ध
      </Badge>
      <HStack gap={2} w="full" flexWrap="wrap">
        <Button
          w={compact ? '100%' : 'auto'}
          bg="#090884" color="white" _hover={{ bg: '#06066e' }}
          onClick={() => st.onDutyAssign && st.onDutyAssign()}
          borderRadius="6px"
          fontSize={compact ? '12px' : '11px'}
          h={compact ? '34px' : '24px'}
          px={compact ? 3 : 2}
          fontWeight="600"
        >
          <ClipboardList size={compact ? 13 : 10} style={{ marginRight: compact ? 6 : 3 }} />
          ड्यूटी असाइन करें
        </Button>
        <Button
          w={compact ? '100%' : 'auto'}
          bg="#22c55e" color="white" _hover={{ bg: '#16a34a' }}
          onClick={() => st.onHolidayAssign && st.onHolidayAssign()}
          borderRadius="6px"
          fontSize={compact ? '12px' : '11px'}
          h={compact ? '34px' : '24px'}
          px={compact ? 3 : 2}
          fontWeight="600"
        >
          <Calendar size={compact ? 13 : 10} style={{ marginRight: compact ? 6 : 3 }} />
          छुट्टी असाइन करें
        </Button>
      </HStack>
    </VStack>
  );

  if (st.status === 'onDuty') return (
    <VStack align="flex-start" gap={1} maxW={compact ? '160px' : '160px'}>
      <HStack gap={1} flexWrap="wrap">
        <Badge bg="#eeeeff" color="#090884" px={2} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
          ● ड्यूटी पर
        </Badge>
        {st.duty?.dutyType && (
          <Badge bg="#e0e7ff" color="#3730a3" px={2} py={1} borderRadius="full" fontSize="10px">
            {DUTY_TYPE_LABELS[st.duty.dutyType] || st.duty.dutyType}
          </Badge>
        )}
      </HStack>
      {st.duty?.title && (
        <Text fontSize="11px" color="#090884" fontWeight="600" lineClamp={2} wordBreak="break-word">
          {st.duty.title}
        </Text>
      )}
      {st.duty?.location && (
        <HStack gap={1} align="flex-start">
          <MapPin size={10} color="#aaa" style={{ marginTop: 2, flexShrink: 0 }} />
          <Text fontSize="10px" color="gray.500" wordBreak="break-word">{st.duty.location}</Text>
        </HStack>
      )}
      <Badge bg="#fff3cd" color="#856404" px={2} py={0.5} borderRadius="full" fontSize="9px" mt={1}>
        ⚠️ पहले ड्यूटी पूर्ण करें
      </Badge>
    </VStack>
  );

  if (st.status === 'deputed') return (
    <VStack align="flex-start" gap={1} maxW={compact ? '160px' : '160px'}>
      <Badge bg="#fff3cd" color="#856404" px={2} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
        ★ स्थानांतरित
      </Badge>
      {st.duty?.title && (
        <Text fontSize="11px" color="#856404" fontWeight="600" lineClamp={2} wordBreak="break-word">
          {st.duty.title}
        </Text>
      )}
      {st.duty?.location && (
        <HStack gap={1} align="flex-start">
          <MapPin size={10} color="#aaa" style={{ marginTop: 2, flexShrink: 0 }} />
          <Text fontSize="10px" color="gray.500" wordBreak="break-word">{st.duty.location}</Text>
        </HStack>
      )}
      <Badge bg="#ffe5e5" color="#fe0808" px={2} py={0.5} borderRadius="full" fontSize="9px" mt={1}>
        ⚠️ विशेष ड्यूटी पूर्ण करें
      </Badge>
    </VStack>
  );

  if (st.status === 'onHoliday') return (
    <VStack align="flex-start" gap={1}>
      <Badge bg="#ffe5e5" color="#fe0808" px={2} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
        ☂ छुट्टी पर
      </Badge>
      {st.holiday?.startDate && (
        <Text fontSize="10px" color="gray.500">
          से: {new Date(st.holiday.startDate).toLocaleDateString('hi-IN')}
        </Text>
      )}
      {st.holiday?.endDate && (
        <Text fontSize="10px" color="#fe0808" fontWeight="600">
          वापसी: {new Date(st.holiday.endDate).toLocaleDateString('hi-IN')}
        </Text>
      )}
      {st.holiday?.reason && (
        <Text fontSize="10px" color="gray.400" lineClamp={1}>{st.holiday.reason}</Text>
      )}
      <Badge bg="#fff3cd" color="#856404" px={2} py={0.5} borderRadius="full" fontSize="9px" mt={1}>
        ⚠️ छुट्टी समाप्त होने तक प्रतीक्षा करें
      </Badge>
    </VStack>
  );

  return <Badge bg="gray.100" color="gray.500" px={2} py={1} borderRadius="full" fontSize="11px">—</Badge>;
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

const LoadingSpinner = () => (
  <Flex h="60vh" alignItems="center" justifyContent="center">
    <VStack><Spinner size="xl" color="#090884" /><Text color="gray.500">लोड हो रहा है...</Text></VStack>
  </Flex>
);

export default Officers;
