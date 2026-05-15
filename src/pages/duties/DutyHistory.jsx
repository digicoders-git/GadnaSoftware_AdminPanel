import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, VStack, HStack, Badge, Table, Spinner, SimpleGrid,
} from '@chakra-ui/react';
import { History, Clock, CheckCircle, XCircle, ClipboardList, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllHistory, getUserHistory, getUsers } from '../../api/services';
import PageHeader from '../../components/PageHeader';

const DutyHistory = () => {
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [hRes, uRes] = await Promise.all([getAllHistory(), getUsers()]);
        setHistory(hRes.data);
        setUsers(uRes.data);
      } catch {
        toast.error('इतिहास लोड करने में समस्या हुई');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleUserFilter = async (userId) => {
    setSelectedUser(userId);
    if (!userId) {
      setStats(null);
      setLoading(true);
      try {
        const { data } = await getAllHistory();
        setHistory(data);
      } catch { toast.error('डेटा लोड नहीं हुआ'); }
      finally { setLoading(false); }
      return;
    }
    setLoading(true);
    try {
      const { data } = await getUserHistory(userId);
      setHistory(data.history);
      setStats(data.stats);
    } catch {
      toast.error('फोर्स स्टाफ का इतिहास लोड नहीं हुआ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="ड्यूटी इतिहास" subtitle="सभी फोर्स स्टाफ का ड्यूटी रिकॉर्ड" icon={History} />

      {/* Filter */}
      <Box bg="white" borderRadius="sm" boxShadow="sm" p={4} mb={4}>
        <Text fontSize="13px" color="gray.600" mb={2} fontWeight="600">फोर्स स्टाफ अनुसार फ़िल्टर करें</Text>
        <Flex gap={3} flexWrap="wrap" alignItems="center">
          <select
            value={selectedUser}
            onChange={(e) => handleUserFilter(e.target.value)}
            style={{
              padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px',
              fontSize: '14px', flex: 1, minWidth: '200px', background: 'white', outline: 'none',
            }}
          >
            <option value="">-- सभी फोर्स स्टाफ --</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.pnoNumber})</option>
            ))}
          </select>
          {selectedUser && (
            <Button size="sm" variant="outline" onClick={() => handleUserFilter('')} fontSize="13px">
              फ़िल्टर डिलीट ✕
            </Button>
          )}
        </Flex>
      </Box>

      {/* Stats when user selected */}
      {stats && (
        <>
          <SimpleGrid columns={{ base: 2, sm: 4 }} gap={3} mb={4}>
            <StatBox icon={ClipboardList} label="कुल असाइनमेंट" value={stats.totalAssignments} color="#090884" />
            <StatBox icon={CheckCircle} label="पूर्ण ड्यूटी" value={stats.totalCompleted} color="#090884" />
            <StatBox icon={XCircle} label="हटाई गई" value={stats.totalRemoved} color="#fe0808" />
            <StatBox icon={Clock} label="कुल घंटे" value={`${stats.totalHours}h`} color="#090884" />
          </SimpleGrid>

          {/* Duty Type Breakdown */}
          {stats.dutyTypeBreakdown && Object.keys(stats.dutyTypeBreakdown).length > 0 && (
            <Box bg="white" borderRadius="sm" boxShadow="sm" p={4} mb={4}>
              <Text fontSize="13px" fontWeight="700" color="gray.700" mb={3}>ड्यूटी प्रकार अनुसार</Text>
              <Flex gap={2} flexWrap="wrap">
                {Object.entries(stats.dutyTypeBreakdown).map(([type, count]) => (
                  <Badge key={type} bg="#eeeeff" color="#090884" px={3} py={1} borderRadius="full" fontSize="12px">
                    {dutyTypeHindi(type)}: {count}
                  </Badge>
                ))}
              </Flex>
            </Box>
          )}
        </>
      )}

      {loading ? (
        <Flex h="40vh" alignItems="center" justifyContent="center">
          <VStack><Spinner size="xl" color="#090884" /><Text color="gray.500">लोड हो रहा है...</Text></VStack>
        </Flex>
      ) : (
        <>
          {/* Desktop Table */}
          <Box display={{ base: 'none', lg: 'block' }} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
            <Box overflowX="auto">
              <Table.Root size="sm">
                <Table.Header bg="#f8f9fa">
                  <Table.Row>
                    <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">#</Table.ColumnHeader>
                    <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">ड्यूटी</Table.ColumnHeader>
                    <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">फोर्स स्टाफ</Table.ColumnHeader>
                    <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">कार्रवाई</Table.ColumnHeader>
                    <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">शुरू (Date/Time)</Table.ColumnHeader>
                    <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">समाप्त (Date/Time)</Table.ColumnHeader>
                    <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">अवधि</Table.ColumnHeader>
                    <Table.ColumnHeader px={4} py={3} fontSize="12px" color="gray.600" fontWeight="700">टिप्पणी</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {history.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={7} textAlign="center" py={10} color="gray.400">कोई इतिहास नहीं मिला</Table.Cell>
                    </Table.Row>
                  ) : (
                    history.map((h, i) => (
                      <Table.Row key={h._id} _hover={{ bg: 'gray.50' }}>
                        <Table.Cell px={4} py={3} fontSize="13px" color="gray.500">{i + 1}</Table.Cell>
                        <Table.Cell px={4} py={3}>
                          <Text fontSize="14px" fontWeight="600" color="gray.700">{h.duty?.title || '—'}</Text>
                          {h.duty?.location && <Text fontSize="11px" color="gray.400">📍 {h.duty.location}</Text>}
                        </Table.Cell>
                        <Table.Cell px={4} py={3}>
                          <Text fontSize="13px" fontWeight="600" color="#090884">{h.user?.name || '—'}</Text>
                          <Text fontSize="11px" color="gray.400">{h.user?.pnoNumber}</Text>
                        </Table.Cell>
                        <Table.Cell px={4} py={3}>
                          <Badge bg={actionColor(h.action).bg} color={actionColor(h.action).color}
                            px={2} py={1} borderRadius="full" fontSize="11px">
                            {actionHindi(h.action)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell px={4} py={3}>
                          <Text fontSize="12px" color="gray.600">
                            {h.startDate ? new Date(h.startDate).toLocaleString('hi-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                          </Text>
                        </Table.Cell>
                        <Table.Cell px={4} py={3}>
                          <Text fontSize="12px" color="gray.600">
                            {h.endDate ? new Date(h.endDate).toLocaleString('hi-IN', { dateStyle: 'short', timeStyle: 'short' }) : (h.action === 'assigned' ? 'सक्रिय...' : '—')}
                          </Text>
                        </Table.Cell>
                        <Table.Cell px={4} py={3}>
                          <Text fontSize="13px" fontWeight="600" color={h.duration ? "#090884" : "gray.400"}>
                            {h.duration ? `${h.duration} घंटे` : '—'}
                          </Text>
                        </Table.Cell>
                        <Table.Cell px={4} py={3}>
                          <Text fontSize="12px" color="gray.500" noOfLines={2}>{h.remarks || '—'}</Text>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
            <Box px={4} py={2} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
              <Text fontSize="12px" color="gray.500">कुल {history.length} रिकॉर्ड</Text>
            </Box>
          </Box>

          {/* Mobile Card View */}
          <Box display={{ base: 'block', lg: 'none' }}>
            {history.length === 0 ? (
              <Box bg="white" borderRadius="sm" p={8} textAlign="center" boxShadow="sm">
                <Text color="gray.400">कोई इतिहास नहीं मिला</Text>
              </Box>
            ) : (
              <VStack gap={3} align="stretch">
                {history.map((h, i) => (
                  <Box key={h._id} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
                    {/* Header */}
                    <Flex px={4} py={3} justifyContent="space-between" alignItems="center"
                      borderLeft={`4px solid ${actionColor(h.action).color}`} bg="gray.50">
                      <Box>
                        <Text fontSize="14px" fontWeight="700" color="gray.800">{h.duty?.title || '—'}</Text>
                        {h.duty?.location && <Text fontSize="11px" color="gray.500">📍 {h.duty.location}</Text>}
                      </Box>
                      <Badge bg={actionColor(h.action).bg} color={actionColor(h.action).color}
                        px={2} py={1} borderRadius="full" fontSize="11px" flexShrink={0}>
                        {actionHindi(h.action)}
                      </Badge>
                    </Flex>
                    {/* Details */}
                    <Box px={4} py={3}>
                      <VStack gap={2} align="stretch">
                        <Flex justifyContent="space-between">
                          <HStack gap={2} color="gray.500">
                            <User size={13} />
                            <Text fontSize="12px">फोर्स स्टाफ</Text>
                          </HStack>
                          <Box textAlign="right">
                            <Text fontSize="13px" fontWeight="700" color="#090884">{h.user?.name || '—'}</Text>
                            <Text fontSize="11px" color="gray.400">{h.user?.pnoNumber}</Text>
                          </Box>
                        </Flex>
                        <Box h="1px" bg="gray.100" />
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text fontSize="12px" color="gray.500">शुरू</Text>
                          <Text fontSize="12px" color="gray.700" fontWeight="600">
                            {h.startDate ? new Date(h.startDate).toLocaleString('hi-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                          </Text>
                        </Flex>
                        <Box h="1px" bg="gray.100" />
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text fontSize="12px" color="gray.500">समाप्त</Text>
                          <Text fontSize="12px" color={h.endDate ? "gray.700" : "blue.500"} fontWeight="600">
                            {h.endDate ? new Date(h.endDate).toLocaleString('hi-IN', { dateStyle: 'short', timeStyle: 'short' }) : (h.action === 'assigned' ? 'सक्रिय' : '—')}
                          </Text>
                        </Flex>
                        <Box h="1px" bg="gray.100" />
                        <Flex justifyContent="space-between" alignItems="center">
                          <HStack gap={2} color="gray.500">
                            <Clock size={13} />
                            <Text fontSize="12px">कुल अवधि</Text>
                          </HStack>
                          <Text fontSize="13px" color="#090884" fontWeight="700">
                            {h.duration ? `${h.duration} घंटे` : '—'}
                          </Text>
                        </Flex>
                        {h.remarks && (
                          <>
                            <Box h="1px" bg="gray.100" />
                            <Box>
                              <Text fontSize="11px" color="gray.500" mb={0.5}>टिप्पणी</Text>
                              <Text fontSize="12px" color="gray.600">{h.remarks}</Text>
                            </Box>
                          </>
                        )}
                        {h.previousUser && (
                          <>
                            <Box h="1px" bg="gray.100" />
                            <Flex justifyContent="space-between">
                              <Text fontSize="12px" color="gray.500">पिछला फोर्स स्टाफ</Text>
                              <Text fontSize="12px" color="orange.500" fontWeight="500">{h.previousUser?.name}</Text>
                            </Flex>
                          </>
                        )}
                      </VStack>
                    </Box>
                  </Box>
                ))}
              </VStack>
            )}
            <Box mt={3} px={1}>
              <Text fontSize="12px" color="gray.500">कुल {history.length} रिकॉर्ड</Text>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

const StatBox = ({ icon: Icon, label, value, color }) => (
  <Flex bg="white" borderRadius="sm" boxShadow="sm" p={3} alignItems="center" gap={3}>
    <Box bg={color} p={2} borderRadius="sm" flexShrink={0}>
      <Icon size={16} color="white" />
    </Box>
    <Box minW={0}>
      <Text fontSize="11px" color="gray.500" noOfLines={1}>{label}</Text>
      <Text fontSize="18px" fontWeight="700" color="gray.700">{value}</Text>
    </Box>
  </Flex>
);

const dutyTypeHindi = (type) => ({
  patrol: 'गश्त', guard: 'पहरा', investigation: 'जांच',
  traffic: 'यातायात', special: 'विशेष', other: 'अन्य',
}[type] || type);

const actionHindi = (a) => ({ assigned: 'असाइन', reassigned: 'पुनः असाइन', removed: 'हटाया', completed: 'पूर्ण' }[a] || a);
const actionColor = (a) => ({
  assigned: { bg: '#eeeeff', color: '#090884' },
  reassigned: { bg: '#fff3cd', color: '#856404' },
  removed: { bg: '#ffe5e5', color: '#fe0808' },
  completed: { bg: '#eeeeff', color: '#090884' },
}[a] || { bg: '#f8f9fa', color: '#6c757d' });

export default DutyHistory;


