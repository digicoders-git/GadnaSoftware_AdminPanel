import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, Input, VStack, HStack, Badge, Table, Spinner, Tabs,
} from '@chakra-ui/react';
import {
  Plus, Pencil, Trash2, Umbrella, AlertTriangle, Calendar, FileText,
  Hash, Phone, Clock, CheckCircle, UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getHolidays, createHoliday, updateHoliday, deleteHoliday,
  getOverdueAlerts, getUsers, getReturnedHolidays,
} from '../../api/services';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [alerts, setAlerts] = useState({ notReturnedAlerts: [], returnedAlerts: [], totalAlerts: 0 });
  const [returned, setReturned] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ userId: '', startDate: '', endDate: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const [hRes, aRes, uRes, rRes] = await Promise.all([
        getHolidays(), getOverdueAlerts(), getUsers(), getReturnedHolidays(),
      ]);
      setHolidays(hRes.data?.holidays || hRes.data || []);
      setAlerts(aRes.data);
      setUsers(uRes.data);
      setReturned(rRes.data?.holidays || rRes.data || []);
    } catch {
      toast.error('डेटा लोड करने में समस्या हुई');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ userId: '', startDate: '', endDate: '', reason: '' });
    setModalOpen(true);
  };

  const openEdit = (h) => {
    setEditing(h);
    setForm({
      userId: h.user?._id || h.user,
      startDate: h.startDate?.slice(0, 10) || '',
      endDate: h.endDate?.slice(0, 10) || '',
      reason: h.reason || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing && !form.userId) { toast.error('कृपया फोर्स स्टाफ चुनें'); return; }
    if (!form.startDate || !form.endDate) { toast.error('कृपया शुरू और समाप्ति तारीख चुनें'); return; }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      toast.error('समाप्ति तारीख शुरू तारीख से बाद की होनी चाहिए'); return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateHoliday(editing._id, { startDate: form.startDate, endDate: form.endDate, reason: form.reason });
        toast.success('छुट्टी सफलतापूर्वक अपडेट हो गई');
      } else {
        await createHoliday(form);
        const selectedUser = users.find(u => u._id === form.userId);
        toast.success(`${selectedUser?.name || 'फोर्स स्टाफ'} की छुट्टी सफलतापूर्वक जोड़ी गई`);
      }
      setModalOpen(false); fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'कुछ गलत हुआ');
    } finally { setSaving(false); }
  };

  const askDelete = (h) => setDeleteConfirm({ open: true, id: h._id, name: h.user?.name || 'फोर्स स्टाफ' });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteHoliday(deleteConfirm.id);
      toast.success(`${deleteConfirm.name} की छुट्टी डिलीट कर दी गई`);
      setDeleteConfirm({ open: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'डिलीट करने में समस्या हुई');
    } finally { setDeleting(false); }
  };

  if (loading) return (
    <Flex h="60vh" alignItems="center" justifyContent="center">
      <VStack><Spinner size="xl" color="#090884" /><Text color="gray.500">लोड हो रहा है...</Text></VStack>
    </Flex>
  );

  return (
    <Box>
      <PageHeader title="छुट्टी प्रबंधन" subtitle="फोर्स स्टाफ की छुट्टी और अलर्ट प्रबंधित करें" icon={Umbrella} />

      {/* Overdue Alert Banner */}
      {alerts.totalAlerts > 0 && (
        <Box bg="#fff3cd" border="1px solid #fe0808" borderRadius="sm" p={4} mb={5}>
          <HStack mb={2} flexWrap="wrap" gap={2}>
            <AlertTriangle size={18} color="#856404" />
            <Text fontWeight="700" color="#856404" fontSize="14px">
              {alerts.totalAlerts} फोर्स स्टाफ की छुट्टी समाप्त — ड्यूटी असाइन नहीं हुई
            </Text>
          </HStack>
          <VStack align="stretch" gap={1}>
            {alerts.notReturnedAlerts?.map((a, i) => (
              <Box key={i} bg="rgba(255,255,255,0.5)" borderRadius="sm" p={2}>
                <Text fontSize="13px" color="#856404" fontWeight="600">{a.user?.name}</Text>
                <Flex gap={3} flexWrap="wrap" mt={1}>
                  <HStack gap={1}><Hash size={12} color="#856404" /><Text fontSize="12px" color="#856404">{a.user?.pnoNumber}</Text></HStack>
                  <HStack gap={1}><Phone size={12} color="#856404" /><Text fontSize="12px" color="#856404">{a.user?.phoneNumber}</Text></HStack>
                  <HStack gap={1}><Clock size={12} color="#856404" /><Text fontSize="12px" color="#856404">{a.overdueBy?.days} दिन देरी</Text></HStack>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      <Tabs.Root defaultValue="all" variant="line">
        <Box bg="white" borderRadius="sm" boxShadow="sm" mb={4} overflow="hidden">
          <Flex px={4} pt={3} justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Tabs.List borderBottom="none" gap={0} flexWrap="wrap">
              {[
                { value: 'all', label: `सभी (${holidays.length})` },
                { value: 'ongoing', label: `चल रही (${holidays.filter(h => h.status === 'ongoing').length})` },
                { value: 'upcoming', label: `आगामी (${holidays.filter(h => h.status === 'upcoming').length})` },
                { value: 'returned', label: `वापस आए (${returned.length})` },
                { value: 'alerts', label: `अलर्ट (${alerts.totalAlerts})`, danger: true },
              ].map(tab => (
                <Tabs.Trigger
                  key={tab.value} value={tab.value}
                  fontSize="13px" px={3} py={2}
                  _selected={{
                    color: tab.danger ? '#fe0808' : '#090884',
                    borderBottom: `2px solid ${tab.danger ? '#fe0808' : '#090884'}`,
                  }}
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Button bg="#090884" color="white" _hover={{ bg: '#06066e' }} onClick={openAdd}
              fontSize="14px" h="40px" borderRadius="6px" px={5} mb={2}
              w={{ base: 'full', sm: 'auto' }}>
              <Plus size={16} style={{ marginRight: 6 }} /> छुट्टी जोड़ें
            </Button>
          </Flex>
        </Box>

        <Tabs.Content value="all">
          <HolidayList data={holidays} onEdit={openEdit} onDelete={askDelete} />
        </Tabs.Content>
        <Tabs.Content value="ongoing">
          <HolidayList data={holidays.filter(h => h.status === 'ongoing')} onEdit={openEdit} onDelete={askDelete} />
        </Tabs.Content>
        <Tabs.Content value="upcoming">
          <HolidayList data={holidays.filter(h => h.status === 'upcoming')} onEdit={openEdit} onDelete={askDelete} />
        </Tabs.Content>
        <Tabs.Content value="returned">
          <ReturnedView data={returned} />
        </Tabs.Content>
        <Tabs.Content value="alerts">
          <AlertsView alerts={alerts} />
        </Tabs.Content>
      </Tabs.Root>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'छुट्टी एडिट करें' : 'नई छुट्टी जोड़ें'}>
        <form onSubmit={handleSave}>
          <VStack gap={4}>
            {!editing && (
              <FF label="फोर्स स्टाफ चुनें *">
                <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  required style={{ width: '100%', height: '48px', padding: '0 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#f7f8fa' }}>
                  <option value="">-- फोर्स स्टाफ चुनें --</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.pnoNumber})</option>)}
                </select>
              </FF>
            )}
            <FF label="शुरू तारीख *">
              <Input type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} required
                fontSize="14px" h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
            <FF label="समाप्ति तारीख *">
              <Input type="date" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} required
                fontSize="14px" h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
            <FF label="कारण">
              <Input placeholder="जैसे: वार्षिक अवकाश" value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                fontSize="14px" h="48px" borderRadius="8px" border="1.5px solid" borderColor="gray.200"
                bg="gray.50" px={4}
                _focus={{ borderColor: '#090884', bg: 'white', boxShadow: '0 0 0 3px rgba(9,8,132,0.08)', outline: 'none' }}
                transition="all 0.2s" />
            </FF>
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
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        loading={deleting}
        type="warning"
        title="छुट्टी डिलीट करें"
        message={`क्या आप सच में ${deleteConfirm.name} की छुट्टी को डिलीट करना चाहते हैं? यह कार्रवाई वापस नहीं की जा सकती।`}
        confirmText="हाँ, डिलीट करें"
        cancelText="नहीं, रहने दें"
      />
    </Box>
  );
};

/* ── Holiday List ── */
const HolidayList = ({ data, onEdit, onDelete }) => (
  <>
    <Box display={{ base: 'none', lg: 'block' }} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
      <Box overflowX="auto">
        <Table.Root size="sm">
          <Table.Header bg="#f8f9fa">
            <Table.Row>
              {['#', 'फोर्स स्टाफ', 'शुरू तारीख', 'समाप्ति तारीख', 'कारण', 'स्थिति', 'कार्रवाई'].map(h => (
                <Table.ColumnHeader key={h} px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">{h}</Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.length === 0 ? (
              <Table.Row><Table.Cell colSpan={7} textAlign="center" py={10} color="gray.400">कोई छुट्टी नहीं मिली</Table.Cell></Table.Row>
            ) : data.map((h, i) => (
              <Table.Row key={h._id} _hover={{ bg: 'gray.50' }}>
                <Table.Cell px={4} py={3} fontSize="13px" color="gray.500">{i + 1}</Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Text fontSize="14px" fontWeight="600" color="gray.700">{h.user?.name || '—'}</Text>
                  <Text fontSize="11px" color="gray.400">{h.user?.pnoNumber}</Text>
                </Table.Cell>
                <Table.Cell px={4} py={3}><Text fontSize="13px" color="gray.600">{new Date(h.startDate).toLocaleDateString('hi-IN')}</Text></Table.Cell>
                <Table.Cell px={4} py={3}><Text fontSize="13px" color="gray.600">{new Date(h.endDate).toLocaleDateString('hi-IN')}</Text></Table.Cell>
                <Table.Cell px={4} py={3}><Text fontSize="13px" color="gray.600">{h.reason || '—'}</Text></Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Badge bg={statusColor(h.status).bg} color={statusColor(h.status).color} px={2} py={1} borderRadius="full" fontSize="11px">
                    {statusHindi(h.status)}
                  </Badge>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <HStack gap={2}>
                    {h.status !== 'completed' && (
                      <Button size="xs" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                        onClick={() => onEdit(h)} borderRadius="4px" px={3} fontSize="12px">
                        <Pencil size={11} style={{ marginRight: 4 }} /> एडिट
                      </Button>
                    )}
                    <Button size="xs" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                      onClick={() => onDelete(h)} borderRadius="4px" px={3} fontSize="12px">
                      <Trash2 size={11} style={{ marginRight: 4 }} /> डिलीट
                    </Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
      <Box px={4} py={2} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
        <Text fontSize="12px" color="gray.500">कुल {data.length} रिकॉर्ड</Text>
      </Box>
    </Box>

    <Box display={{ base: 'block', lg: 'none' }}>
      {data.length === 0 ? (
        <Box bg="white" borderRadius="sm" p={8} textAlign="center" boxShadow="sm">
          <Text color="gray.400">कोई छुट्टी नहीं मिली</Text>
        </Box>
      ) : (
        <VStack gap={3} align="stretch">
          {data.map((h, i) => (
            <Box key={h._id} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
              <Flex px={4} py={3} justifyContent="space-between" alignItems="center"
                borderLeft={`4px solid ${statusColor(h.status).color}`}>
                <HStack gap={3}>
                  <Box bg="#eeeeff" borderRadius="full" w="30px" h="30px"
                    display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                    <Text color="#090884" fontSize="12px" fontWeight="700">{i + 1}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="15px" fontWeight="700" color="gray.800">{h.user?.name || '—'}</Text>
                    <Text fontSize="11px" color="gray.400">{h.user?.pnoNumber}</Text>
                  </Box>
                </HStack>
                <Badge bg={statusColor(h.status).bg} color={statusColor(h.status).color}
                  px={2} py={1} borderRadius="full" fontSize="11px" flexShrink={0}>
                  {statusHindi(h.status)}
                </Badge>
              </Flex>
              <Box px={4} py={3} borderTop="1px solid" borderColor="gray.100">
                <VStack gap={2} align="stretch">
                  <Flex justifyContent="space-between" alignItems="center">
                    <HStack gap={2} color="gray.500"><Calendar size={13} /><Text fontSize="12px">शुरू तारीख</Text></HStack>
                    <Text fontSize="13px" color="gray.700" fontWeight="500">{new Date(h.startDate).toLocaleDateString('hi-IN')}</Text>
                  </Flex>
                  <Box h="1px" bg="gray.100" />
                  <Flex justifyContent="space-between" alignItems="center">
                    <HStack gap={2} color="gray.500"><Calendar size={13} /><Text fontSize="12px">समाप्ति तारीख</Text></HStack>
                    <Text fontSize="13px" color="gray.700" fontWeight="500">{new Date(h.endDate).toLocaleDateString('hi-IN')}</Text>
                  </Flex>
                  {h.reason && (
                    <>
                      <Box h="1px" bg="gray.100" />
                      <Flex justifyContent="space-between" alignItems="center">
                        <HStack gap={2} color="gray.500"><FileText size={13} /><Text fontSize="12px">कारण</Text></HStack>
                        <Text fontSize="13px" color="gray.700">{h.reason}</Text>
                      </Flex>
                    </>
                  )}
                </VStack>
              </Box>
              <Box borderTop="1px solid" borderColor="gray.100" px={4} py={3}>
                <Flex gap={2} w="full">
                  {h.status !== 'completed' && (
                    <Button flex={1} size="sm" bg="#090884" color="white" _hover={{ bg: '#06066e' }}
                      onClick={() => onEdit(h)} borderRadius="6px" fontSize="13px" h="36px">
                      <Pencil size={13} style={{ marginRight: 5 }} /> एडिट
                    </Button>
                  )}
                  <Button flex={1} size="sm" bg="#fe0808" color="white" _hover={{ bg: '#d10606' }}
                    onClick={() => onDelete(h)} borderRadius="6px" fontSize="13px" h="36px">
                    <Trash2 size={13} style={{ marginRight: 5 }} /> डिलीट
                  </Button>
                </Flex>
              </Box>
            </Box>
          ))}
        </VStack>
      )}
      <Box mt={3} px={1}><Text fontSize="12px" color="gray.500">कुल {data.length} रिकॉर्ड</Text></Box>
    </Box>
  </>
);

/* ── Returned View ── */
const ReturnedView = ({ data }) => {
  if (!data || data.length === 0) return (
    <Box bg="white" borderRadius="sm" p={10} textAlign="center" boxShadow="sm">
      <UserCheck size={32} color="#ccc" style={{ margin: '0 auto 8px' }} />
      <Text color="gray.500" fontWeight="600">आज कोई फोर्स स्टाफ वापस नहीं आया</Text>
      <Text color="gray.400" fontSize="13px">जिनकी छुट्टी आज समाप्त हुई वे यहाँ दिखेंगे</Text>
    </Box>
  );

  return (
    <VStack align="stretch" gap={3}>
      {data.map((h, i) => (
        <Box key={h._id} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden"
          borderLeft="4px solid #090884">
          <Flex px={4} py={3} justifyContent="space-between" alignItems="center">
            <HStack gap={3}>
              <Box bg="#090884" borderRadius="full" p={2} flexShrink={0}>
                <UserCheck size={16} color="white" />
              </Box>
              <Box>
                <Text fontSize="15px" fontWeight="700" color="gray.800">{h.user?.name || '—'}</Text>
                <Text fontSize="12px" color="gray.500">{h.user?.pnoNumber} • {h.user?.designation?.name}</Text>
              </Box>
            </HStack>
            <Badge bg="#eeeeff" color="#090884" px={3} py={1} borderRadius="full" fontSize="12px">
              वापस आए
            </Badge>
          </Flex>
          <Box px={4} py={3} borderTop="1px solid" borderColor="gray.100">
            <Flex gap={4} flexWrap="wrap">
              <HStack gap={1}>
                <Calendar size={13} color="gray.400" />
                <Text fontSize="12px" color="gray.500">छुट्टी: {new Date(h.startDate).toLocaleDateString('hi-IN')} से {new Date(h.endDate).toLocaleDateString('hi-IN')}</Text>
              </HStack>
              {h.reason && (
                <HStack gap={1}>
                  <FileText size={13} color="gray.400" />
                  <Text fontSize="12px" color="gray.500">{h.reason}</Text>
                </HStack>
              )}
            </Flex>
          </Box>
        </Box>
      ))}
      <Box><Text fontSize="12px" color="gray.500">कुल {data.length} फोर्स स्टाफ आज वापस आए</Text></Box>
    </VStack>
  );
};

/* ── Alerts View ── */
const AlertsView = ({ alerts }) => (
  <VStack align="stretch" gap={4}>
    {alerts.notReturnedAlerts?.length > 0 && (
      <Box>
        <HStack gap={2} mb={3}>
          <AlertTriangle size={16} color="#856404" />
          <Text fontSize="14px" fontWeight="700" color="#856404">वापस नहीं आए ({alerts.notReturnedAlerts.length})</Text>
        </HStack>
        <VStack align="stretch" gap={3}>
          {alerts.notReturnedAlerts.map((a, i) => (
            <Box key={i} bg="#fff3cd" border="1px solid #fe0808" borderRadius="sm" p={4}>
              <Text fontSize="14px" fontWeight="700" color="#856404" mb={2}>{a.user?.name}</Text>
              <VStack align="stretch" gap={1}>
                <Flex gap={4} flexWrap="wrap">
                  <HStack gap={1}><Hash size={13} color="#856404" /><Text fontSize="13px" color="#856404">PNO: {a.user?.pnoNumber}</Text></HStack>
                  <HStack gap={1}><Phone size={13} color="#856404" /><Text fontSize="13px" color="#856404">{a.user?.phoneNumber}</Text></HStack>
                </Flex>
                <HStack gap={1}>
                  <Clock size={13} color="#856404" />
                  <Text fontSize="13px" color="#856404">{a.overdueBy?.days} दिन, {a.overdueBy?.hours} घंटे देरी</Text>
                </HStack>
                <HStack gap={1}>
                  <Calendar size={13} color="#856404" />
                  <Text fontSize="12px" color="#856404">
                    छुट्टी: {new Date(a.holiday?.startDate).toLocaleDateString('hi-IN')} से {new Date(a.holiday?.endDate).toLocaleDateString('hi-IN')}
                  </Text>
                </HStack>
                {a.holiday?.reason && (
                  <HStack gap={1}>
                    <FileText size={13} color="#856404" />
                    <Text fontSize="12px" color="#856404">कारण: {a.holiday.reason}</Text>
                  </HStack>
                )}
              </VStack>
            </Box>
          ))}
        </VStack>
      </Box>
    )}

    {alerts.returnedAlerts?.length > 0 && (
      <Box>
        <HStack gap={2} mb={3}>
          <CheckCircle size={16} color="#090884" />
          <Text fontSize="14px" fontWeight="700" color="#090884">वापस आ गए ({alerts.returnedAlerts.length})</Text>
        </HStack>
        <VStack align="stretch" gap={2}>
          {alerts.returnedAlerts.map((a, i) => (
            <Box key={i} bg="#eeeeff" border="1px solid #090884" borderRadius="sm" p={4}>
              <Text fontSize="14px" fontWeight="700" color="#090884">{a.user?.name}</Text>
              <Text fontSize="13px" color="#090884" mt={1}>{a.message}</Text>
            </Box>
          ))}
        </VStack>
      </Box>
    )}

    {alerts.totalAlerts === 0 && (!alerts.returnedAlerts || alerts.returnedAlerts.length === 0) && (
      <Box bg="white" borderRadius="sm" p={10} textAlign="center" boxShadow="sm">
        <CheckCircle size={32} color="#090884" style={{ margin: '0 auto 8px' }} />
        <Text color="gray.500" fontWeight="600">कोई अलर्ट नहीं है</Text>
        <Text color="gray.400" fontSize="13px">सभी फोर्स स्टाफ समय पर ड्यूटी पर हैं</Text>
      </Box>
    )}
  </VStack>
);

const FF = ({ label, children }) => (
  <Box w="full"><Text fontSize="13px" color="gray.600" mb={1} fontWeight="500">{label}</Text>{children}</Box>
);

const selectStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
  borderRadius: '4px', fontSize: '14px', outline: 'none', background: 'white',
};

const statusHindi = (s) => ({ upcoming: 'आगामी', ongoing: 'चल रही', completed: 'समाप्त' }[s] || s);
const statusColor = (s) => ({
  upcoming: { bg: '#fff3cd', color: '#856404' },
  ongoing: { bg: '#eeeeff', color: '#090884' },
  completed: { bg: '#ffe5e5', color: '#fe0808' },
}[s] || { bg: '#f8f9fa', color: '#6c757d' });

export default Holidays;
