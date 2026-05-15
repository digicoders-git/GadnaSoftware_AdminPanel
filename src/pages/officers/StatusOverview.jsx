import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, SimpleGrid, VStack, HStack, Badge, Spinner, Tabs,
} from '@chakra-ui/react';
import {
  Users, UserCheck, MapPin, Umbrella, Star, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getUserStatusOverview } from '../../api/services';
import PageHeader from '../../components/PageHeader';

const DUTY_TYPE_HINDI = {
  patrol: 'गश्त', guard: 'पहरा', investigation: 'जांच',
  traffic: 'यातायात', special: 'विशेष', other: 'अन्य',
};

const StatusOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await getUserStatusOverview();
      setData(res);
    } catch {
      toast.error('स्थिति लोड करने में समस्या हुई');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <Flex h="60vh" alignItems="center" justifyContent="center">
      <VStack><Spinner size="xl" color="#090884" /><Text color="gray.500">लोड हो रहा है...</Text></VStack>
    </Flex>
  );

  const summary = data?.summary || {};

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={5}
        bg="white" p={4} borderRadius="sm" boxShadow="sm" flexWrap="wrap" gap={2}>
        <HStack gap={3}>
          <Box bg="#090884" p={2} borderRadius="sm"><Users size={20} color="white" /></Box>
          <Box>
            <Text fontSize={{ base: '16px', md: '20px' }} fontWeight="700" color="gray.700">
              फोर्स स्टाफ स्थिति अवलोकन
            </Text>
            <Text fontSize="12px" color="gray.500">सभी फोर्स स्टाफ की वर्तमान स्थिति</Text>
          </Box>
        </HStack>
        <Flex gap={2} alignItems="center">
          <Text fontSize="12px" color="gray.400">🏠 / स्थिति अवलोकन</Text>
          <Box
            cursor="pointer" p={2} borderRadius="sm" _hover={{ bg: 'gray.100' }}
            onClick={fetchData} title="रिफ्रेश करें"
          >
            <RefreshCw size={16} color="#090884" />
          </Box>
        </Flex>
      </Flex>

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 3, md: 4 }} mb={6}>
        <SummaryCard icon={Users} label="कुल फोर्स स्टाफ" value={data?.totalUsers || 0} color="#090884" onClick={() => navigate('/stats/active-officers')} />
        <SummaryCard icon={UserCheck} label="उपलब्ध" value={summary.available || 0} color="#22c55e" onClick={() => navigate('/stats/available')} />
        <SummaryCard icon={MapPin} label="ड्यूटी पर" value={summary.onDuty || 0} color="#090884" onClick={() => navigate('/duties')} />
        <SummaryCard icon={Umbrella} label="छुट्टी पर" value={summary.onHoliday || 0} color="#fe0808" onClick={() => navigate('/stats/on-holiday')} />
      </SimpleGrid>

      {/* Tabs */}
      <Tabs.Root defaultValue="available" variant="line">
        <Box bg="white" borderRadius="sm" boxShadow="sm" mb={4} overflow="hidden">
          <Box px={4} pt={3} overflowX="auto">
            <Tabs.List borderBottom="none" gap={0} flexWrap="nowrap" minW="max-content">
              <TabBtn value="available" label={`उपलब्ध (${summary.available || 0})`} color="#090884" />
              <TabBtn value="duty" label={`ड्यूटी पर (${summary.onDuty || 0})`} color="#fe0808" />
              <TabBtn value="deputed" label={`स्थानांतरित(${summary.deputed || 0})`} color="#fe0808" />
              <TabBtn value="holiday" label={`छुट्टी पर (${summary.onHoliday || 0})`} color="#fe0808" />
            </Tabs.List>
          </Box>
        </Box>

        {/* Available */}
        <Tabs.Content value="available">
          <OfficerGrid
            officers={data?.available || []}
            emptyMsg="कोई उपलब्ध फोर्स स्टाफ नहीं"
            badgeColor="#090884"
            badgeLabel="उपलब्ध"
            borderColor="#090884"
          />
        </Tabs.Content>

        {/* On Duty - grouped by type */}
        <Tabs.Content value="duty">
          {data?.dutyWise?.length > 0 ? (
            <VStack align="stretch" gap={5}>
              {data.dutyWise.map((group) => (
                <Box key={group.dutyType}>
                  <Flex alignItems="center" gap={2} mb={3}>
                    <Box bg="#090884" px={3} py={1} borderRadius="full">
                      <Text color="white" fontSize="12px" fontWeight="700">
                        {DUTY_TYPE_HINDI[group.dutyType] || group.dutyType} — {group.total} फोर्स स्टाफ
                      </Text>
                    </Box>
                  </Flex>
                  <OfficerGrid
                    officers={group.users}
                    emptyMsg="कोई फोर्स स्टाफ नहीं"
                    badgeColor="#fe0808"
                    badgeLabel={DUTY_TYPE_HINDI[group.dutyType] || group.dutyType}
                    borderColor="#fe0808"
                    showDuty
                  />
                </Box>
              ))}
            </VStack>
          ) : (
            <EmptyState msg="कोई फोर्स स्टाफ ड्यूटी पर नहीं है" />
          )}
        </Tabs.Content>

        {/* Deputed */}
        <Tabs.Content value="deputed">
          <OfficerGrid
            officers={data?.deputed || []}
            emptyMsg="कोई स्थानांतरितफोर्स स्टाफ नहीं"
            badgeColor="#fe0808"
            badgeLabel="स्थानांतरित"
            borderColor="#fe0808"
            showDuty
          />
        </Tabs.Content>

        {/* On Holiday */}
        <Tabs.Content value="holiday">
          <OfficerGrid
            officers={data?.onHoliday || []}
            emptyMsg="कोई फोर्स स्टाफ छुट्टी पर नहीं"
            badgeColor="#fe0808"
            badgeLabel="छुट्टी पर"
            borderColor="#fe0808"
            showHoliday
          />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

/* ── Officer Grid ── */
// Backend structure:
// available  → direct user objects
// dutyWise/deputed → { user, duty } objects
// onHoliday  → { user, holiday } objects
const OfficerGrid = ({ officers, emptyMsg, badgeColor, badgeLabel, borderColor, showDuty, showHoliday }) => {
  if (!officers || officers.length === 0) return <EmptyState msg={emptyMsg} />;

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={3}>
      {officers.map((item, idx) => {
        // available array mein direct user, baaki mein { user, duty/holiday }
        const u = (showDuty || showHoliday) ? item.user : item;
        const dutyInfo = showDuty ? item.duty : null;
        const holidayInfo = showHoliday ? item.holiday : null;
        const key = u?._id || idx;
        return (
          <Box key={key} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden"
            borderLeft={`4px solid ${borderColor}`}>
            <Box px={4} py={3}>
              <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box flex="1" mr={2}>
                  <Text fontSize="14px" fontWeight="700" color="gray.800" noOfLines={1}>{u?.name || '—'}</Text>
                  <Text fontSize="12px" color="gray.500">{u?.designation?.name || '—'}</Text>
                </Box>
                <Badge bg={badgeColor} color="white" px={2} py={0.5} borderRadius="full" fontSize="10px" flexShrink={0}>
                  {badgeLabel}
                </Badge>
              </Flex>
              <VStack align="stretch" gap={1}>
                <Flex justifyContent="space-between">
                  <Text fontSize="11px" color="gray.500">PNO</Text>
                  <Text fontSize="12px" fontWeight="700" color="#090884" fontFamily="monospace">{u?.pnoNumber || '—'}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text fontSize="11px" color="gray.500">फोन</Text>
                  <Text fontSize="12px" color="gray.600">{u?.phoneNumber || '—'}</Text>
                </Flex>
                {showDuty && dutyInfo && (
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="11px" color="gray.500">ड्यूटी</Text>
                    <Text fontSize="12px" color="#fe0808" fontWeight="600" noOfLines={1} maxW="60%">
                      {dutyInfo.title || '—'}
                    </Text>
                  </Flex>
                )}
                {showHoliday && holidayInfo && (
                  <Flex justifyContent="space-between">
                    <Text fontSize="11px" color="gray.500">वापसी</Text>
                    <Text fontSize="12px" color="#fe0808" fontWeight="600">
                      {new Date(holidayInfo.endDate).toLocaleDateString('hi-IN')}
                    </Text>
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
  <Flex bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden" h="85px"
    cursor="pointer" transition="all 0.2s"
    _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
    onClick={onClick}
  >
    <Flex bg={color} w={{ base: '60px', md: '70px' }} alignItems="center" justifyContent="center" flexShrink={0}>
      <Icon size={26} color="white" />
    </Flex>
    <Flex direction="column" p={3} justifyContent="center" flex="1" minW={0}>
      <Text fontSize={{ base: '10px', md: '11px' }} color="gray.500" fontWeight="700" textTransform="uppercase" noOfLines={1}>
        {label}
      </Text>
      <Text fontSize={{ base: '22px', md: '26px' }} fontWeight="700" color="gray.800" lineHeight="1.2">
        {value}
      </Text>
    </Flex>
  </Flex>
);

const TabBtn = ({ value, label, color }) => (
  <Tabs.Trigger value={value} fontSize="13px" px={3} py={2}
    _selected={{ color, borderBottom: `2px solid ${color}` }}>
    {label}
  </Tabs.Trigger>
);

const EmptyState = ({ msg }) => (
  <Box bg="white" borderRadius="sm" p={10} textAlign="center" boxShadow="sm">
    <Users size={32} color="#ccc" style={{ margin: '0 auto 8px' }} />
    <Text color="gray.400" fontSize="14px">{msg}</Text>
  </Box>
);

export default StatusOverview;


