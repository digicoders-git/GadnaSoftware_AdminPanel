import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, SimpleGrid, VStack, HStack, Badge, Spinner, Tabs, Button,
} from '@chakra-ui/react';
import {
  Users, UserCheck, MapPin, Umbrella, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getUserStatusOverview, getUsers } from '../../api/services';
import PageHeader from '../../components/PageHeader';

const DUTY_TYPE_HINDI = {
  patrol: 'गश्त', guard: 'पहरा', investigation: 'जांच',
  traffic: 'यातायात', special: 'विशेष', other: 'अन्य',
};

const StatusOverview = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const navigate = useNavigate();

  // Tab-specific data and pagination
  const [tabData, setTabData] = useState({
    available: { list: [], page: 1, totalPages: 1, totalCount: 0, loading: false },
    duty: { list: [], page: 1, totalPages: 1, totalCount: 0, loading: false },
    deputed: { list: [], page: 1, totalPages: 1, totalCount: 0, loading: false },
    holiday: { list: [], page: 1, totalPages: 1, totalCount: 0, loading: false },
  });

  const limit = 12;

  const fetchOverview = async () => {
    try {
      const { data } = await getUserStatusOverview();
      setOverview(data);
    } catch {
      toast.error('सारांश लोड करने में समस्या हुई');
    }
  };

  const fetchTabData = async (tab, page) => {
    setTabData(prev => ({ ...prev, [tab]: { ...prev[tab], loading: true } }));
    try {
      let status = tab;
      if (tab === 'duty') status = 'onDuty';
      if (tab === 'holiday') status = 'onHoliday';
      
      const { data } = await getUsers(`?status=${status}&page=${page}&limit=${limit}`);
      
      setTabData(prev => ({
        ...prev,
        [tab]: {
          list: data.users,
          page,
          totalPages: data.pages,
          totalCount: data.total,
          loading: false
        }
      }));
    } catch {
      toast.error('डेटा लोड करने में समस्या हुई');
      setTabData(prev => ({ ...prev, [tab]: { ...prev[tab], loading: false } }));
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchOverview(), fetchTabData('available', 1)]);
      setLoading(false);
    };
    init();
  }, []);

  // Fetch data when tab changes or page changes
  useEffect(() => {
    if (!loading && tabData[activeTab].list.length === 0 && tabData[activeTab].totalCount === 0) {
      fetchTabData(activeTab, 1);
    }
  }, [activeTab]);

  const handlePageChange = (tab, newPage) => {
    fetchTabData(tab, newPage);
  };

  if (loading) return (
    <Flex h="60vh" alignItems="center" justifyContent="center">
      <VStack><Spinner size="xl" color="#090884" /><Text color="gray.500">लोड हो रहा है...</Text></VStack>
    </Flex>
  );

  const summary = overview?.summary || {};

  return (
    <Box pb={10}>
      <Flex justifyContent="space-between" alignItems="center" mb={5}
        bg="white" p={4} borderRadius="sm" boxShadow="sm" flexWrap="wrap" gap={2}>
        <HStack gap={3}>
          <Box bg="#090884" p={2} borderRadius="sm"><Users size={20} color="white" /></Box>
          <Box>
            <Text fontSize={{ base: '16px', md: '20px' }} fontWeight="700" color="gray.700">फोर्स स्टाफ स्थिति अवलोकन</Text>
            <Text fontSize="12px" color="gray.500">सभी फोर्स स्टाफ की वर्तमान स्थिति</Text>
          </Box>
        </HStack>
        <Flex gap={2} alignItems="center">
          <Text fontSize="12px" color="gray.400">🏠 / स्थिति अवलोकन</Text>
          <Box cursor="pointer" p={2} borderRadius="sm" _hover={{ bg: 'gray.100' }} onClick={() => window.location.reload()}>
            <RefreshCw size={16} color="#090884" />
          </Box>
        </Flex>
      </Flex>

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 3, md: 4 }} mb={6}>
        <SummaryCard icon={Users} label="कुल फोर्स स्टाफ" value={overview?.totalUsers || 0} color="#090884" onClick={() => navigate('/stats/active-officers')} />
        <SummaryCard icon={UserCheck} label="उपलब्ध" value={summary.available || 0} color="#22c55e" onClick={() => navigate('/stats/available')} />
        <SummaryCard icon={MapPin} label="ड्यूटी पर" value={summary.onDuty || 0} color="#090884" onClick={() => navigate('/stats/on-duty')} />
        <SummaryCard icon={Umbrella} label="छुट्टी पर" value={summary.onHoliday || 0} color="#fe0808" onClick={() => navigate('/stats/on-holiday')} />
      </SimpleGrid>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)} variant="line">
        <Box bg="white" borderRadius="sm" boxShadow="sm" mb={4} overflow="hidden">
          <Box px={4} pt={3} overflowX="auto">
            <Tabs.List borderBottom="none" gap={0} flexWrap="nowrap" minW="max-content">
              <TabBtn value="available" label={`उपलब्ध (${summary.available || 0})`} color="#090884" />
              <TabBtn value="duty" label={`ड्यूटी पर (${summary.onDuty || 0})`} color="#090884" />
              <TabBtn value="deputed" label={`स्थानांतरित (${summary.deputed || 0})`} color="#fe0808" />
              <TabBtn value="holiday" label={`छुट्टी पर (${summary.onHoliday || 0})`} color="#fe0808" />
            </Tabs.List>
          </Box>
        </Box>

        {/* Tab Contents */}
        {['available', 'duty', 'deputed', 'holiday'].map(tab => (
          <Tabs.Content key={tab} value={tab}>
            <VStack align="stretch" gap={4}>
              {tabData[tab].loading ? (
                <Flex h="200px" align="center" justify="center"><Spinner color="#090884" /></Flex>
              ) : (
                <>
                  <OfficerGrid 
                    officers={tabData[tab].list} 
                    emptyMsg={`कोई फोर्स स्टाफ ${tab === 'available' ? 'उपलब्ध' : (tab === 'duty' ? 'ड्यूटी पर' : (tab === 'deputed' ? 'स्थानांतरित' : 'छुट्टी पर'))} नहीं है`}
                    badgeColor={tab === 'available' ? '#090884' : '#fe0808'}
                    badgeLabel={tab === 'available' ? 'उपलब्ध' : (tab === 'duty' ? 'ड्यूटी पर' : (tab === 'deputed' ? 'स्थानांतरित' : 'छुट्टी पर'))}
                    borderColor={tab === 'available' ? '#090884' : '#fe0808'}
                    showDuty={tab === 'duty' || tab === 'deputed'}
                    showHoliday={tab === 'holiday'}
                  />
                  
                  {tabData[tab].totalPages > 1 && (
                    <Flex justifyContent="space-between" alignItems="center" p={4} bg="white" borderRadius="sm" boxShadow="sm">
                      <Text fontSize="14px" color="gray.500">पेज <b>{tabData[tab].page}</b> / {tabData[tab].totalPages}</Text>
                      <HStack gap={2}>
                        <Button size="sm" variant="outline" onClick={() => handlePageChange(tab, tabData[tab].page - 1)} disabled={tabData[tab].page === 1} leftIcon={<ChevronLeft size={16} />}>पिछला</Button>
                        <Button size="sm" variant="outline" onClick={() => handlePageChange(tab, tabData[tab].page + 1)} disabled={tabData[tab].page === tabData[tab].totalPages} rightIcon={<ChevronRight size={16} />}>अगला</Button>
                      </HStack>
                    </Flex>
                  )}
                </>
              )}
            </VStack>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Box>
  );
};

const OfficerGrid = ({ officers, emptyMsg, badgeColor, badgeLabel, borderColor, showDuty, showHoliday }) => {
  if (!officers || officers.length === 0) return <EmptyState msg={emptyMsg} />;

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={3}>
      {officers.map((u, idx) => {
        // Now u is always the flattened user object from backend aggregation
        const key = u?._id || idx;
        return (
          <Box key={key} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden" borderLeft={`4px solid ${borderColor}`}>
            <Box px={4} py={3}>
              <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box flex="1" mr={2}>
                  <Text fontSize="14px" fontWeight="700" color="gray.800" noOfLines={1}>{u?.name || '—'}</Text>
                  <Text fontSize="12px" color="gray.500">{u?.designation?.name || '—'}</Text>
                </Box>
                <Badge bg={badgeColor} color="white" px={2} py={0.5} borderRadius="full" fontSize="10px" flexShrink={0}>{badgeLabel}</Badge>
              </Flex>
              <VStack align="stretch" gap={1}>
                <Flex justifyContent="space-between"><Text fontSize="11px" color="gray.500">PNO</Text><Text fontSize="12px" fontWeight="700" color="#090884" fontFamily="monospace">{u?.pnoNumber || '—'}</Text></Flex>
                <Flex justifyContent="space-between"><Text fontSize="11px" color="gray.500">फोन</Text><Text fontSize="12px" color="gray.600">{u?.phoneNumber || '—'}</Text></Flex>
                {showDuty && u.activeDuty && (
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="11px" color="gray.500">ड्यूटी</Text>
                    <Text fontSize="12px" color="#fe0808" fontWeight="600" noOfLines={1} maxW="60%">{u.activeDuty.title || DUTY_TYPE_HINDI[u.activeDuty.dutyType] || '—'}</Text>
                  </Flex>
                )}
                {showHoliday && u.currentHoliday && (
                  <Flex justifyContent="space-between">
                    <Text fontSize="11px" color="gray.500">वापसी</Text>
                    <Text fontSize="12px" color="#fe0808" fontWeight="600">{new Date(u.currentHoliday.endDate).toLocaleDateString('hi-IN')}</Text>
                  </Flex>
                )}
              </VStack>
            </Box>
          </Box>
        );
      })}
    </SimpleGrid>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color, onClick }) => (
  <Flex bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden" h="85px" cursor="pointer" transition="all 0.2s" _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }} onClick={onClick}>
    <Flex bg={color} w={{ base: '60px', md: '70px' }} alignItems="center" justifyContent="center" flexShrink={0}><Icon size={26} color="white" /></Flex>
    <Flex direction="column" p={3} justifyContent="center" flex="1" minW={0}>
      <Text fontSize={{ base: '10px', md: '11px' }} color="gray.500" fontWeight="700" textTransform="uppercase" noOfLines={1}>{label}</Text>
      <Text fontSize={{ base: '22px', md: '26px' }} fontWeight="700" color="gray.800" lineHeight="1.2">{value}</Text>
    </Flex>
  </Flex>
);

const TabBtn = ({ value, label, color }) => (
  <Tabs.Trigger value={value} fontSize="13px" px={3} py={2} _selected={{ color, borderBottom: `2px solid ${color}` }}>{label}</Tabs.Trigger>
);

const EmptyState = ({ msg }) => (
  <Box bg="white" borderRadius="sm" p={10} textAlign="center" boxShadow="sm">
    <Users size={32} color="#ccc" style={{ margin: '0 auto 8px' }} />
    <Text color="gray.400" fontSize="14px">{msg}</Text>
  </Box>
);

export default StatusOverview;
