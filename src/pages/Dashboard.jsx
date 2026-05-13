import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, SimpleGrid, VStack, HStack, Badge, Spinner,
} from '@chakra-ui/react';
import {
  Users, UserCheck, Umbrella, MapPin, AlertTriangle, CalendarCheck,
  Shield, TrendingUp, UserX, Home, Hash, Phone, Clock, ChevronRight, Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserStatusOverview, getOverdueAlerts, getTodayHolidays } from '../api/services';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [todayHolidays, setTodayHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ovRes, alRes, thRes] = await Promise.all([
          getUserStatusOverview(),
          getOverdueAlerts(),
          getTodayHolidays(),
        ]);
        setOverview(ovRes.data);
        setAlerts(alRes.data?.notReturnedAlerts || []);
        setTodayHolidays(thRes.data?.holidays || []);
      } catch {
        toast.error('डेटा लोड करने में समस्या हुई');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <Flex h="60vh" alignItems="center" justifyContent="center">
        <VStack gap={3}>
          <Spinner size="xl" color="#090884" />
          <Text color="gray.500" fontSize="14px">डेटा लोड हो रहा है...</Text>
        </VStack>
      </Flex>
    );
  }

  const summary = overview?.summary || {};

  return (
    <Box>
      {/* Page Header */}
      <Flex
        justifyContent="space-between" alignItems="center" mb={5}
        bg="white" p={4} borderRadius="sm" boxShadow="sm" flexWrap="wrap" gap={2}
        borderLeft="4px solid #090884"
      >
        <HStack gap={3}>
          <Box bg="#090884" p={2} borderRadius="sm">
            <Shield size={20} color="white" />
          </Box>
          <Box>
            <Text fontSize={{ base: '16px', md: '20px' }} fontWeight="700" color="gray.700">
              डैशबोर्ड
            </Text>
            <Text fontSize="12px" color="gray.500">पुलिस लाइन ड्यूटी प्रबंधन प्रणाली</Text>
          </Box>
        </HStack>
        <HStack gap={1}>
          <Home size={13} color="#aaa" />
          <Text fontSize="12px" color="gray.400">डैशबोर्ड</Text>
        </HStack>
      </Flex>

      {/* Overdue Alert Banner */}
      {alerts.length > 0 && (
        <Box bg="#fff3cd" border="1px solid #fe0808" borderRadius="sm" p={4} mb={5}>
          <HStack mb={3} gap={2}>
            <AlertTriangle size={18} color="#856404" />
            <Text fontWeight="700" color="#856404" fontSize={{ base: '13px', md: '14px' }}>
              {alerts.length} अधिकारी की छुट्टी समाप्त — ड्यूटी असाइन नहीं हुई
            </Text>
          </HStack>
          <VStack align="stretch" gap={2}>
            {alerts.map((a, i) => (
              <Box key={i} bg="rgba(255,255,255,0.6)" borderRadius="sm" p={3}>
                <Text fontSize="13px" fontWeight="700" color="#856404">{a.user?.name}</Text>
                <Flex gap={3} flexWrap="wrap" mt={1}>
                  <HStack gap={1}>
                    <Hash size={12} color="#856404" />
                    <Text fontSize="12px" color="#856404">{a.user?.pnoNumber}</Text>
                  </HStack>
                  <HStack gap={1}>
                    <Phone size={12} color="#856404" />
                    <Text fontSize="12px" color="#856404">{a.user?.phoneNumber}</Text>
                  </HStack>
                  <HStack gap={1}>
                    <Clock size={12} color="#856404" />
                    <Text fontSize="12px" color="#856404">{a.overdueBy?.days} दिन देरी</Text>
                  </HStack>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* Stat Cards */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={{ base: 3, md: 4 }} mb={5}>
        <StatCard icon={Users} label="कुल सक्रिय" value={overview?.totalUsers || 0} color="#090884" onClick={() => navigate('/stats/active-officers')} />
        <StatCard icon={UserCheck} label="उपलब्ध" value={summary.available || 0} color="#090884" onClick={() => navigate('/stats/available')} />
        <StatCard icon={MapPin} label="ड्यूटी पर" value={summary.onDuty || 0} color="#fe0808" onClick={() => navigate('/stats/on-duty')} />
        <StatCard icon={Star} label="प्रतिनियुक्त" value={summary.deputed || 0} color="#856404" onClick={() => navigate('/stats/deputed')} />
        <StatCard icon={Umbrella} label="छुट्टी पर" value={summary.onHoliday || 0} color="#fe0808" onClick={() => navigate('/stats/on-holiday')} />
      </SimpleGrid>

      {/* Second Row */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5} mb={5}>
        {/* Duty Type Breakdown */}
        <Box bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
          <Flex bg="#090884" px={4} py={3} alignItems="center" gap={2}>
            <TrendingUp size={16} color="white" />
            <Text color="white" fontWeight="600" fontSize="14px">ड्यूटी प्रकार अनुसार अधिकारी</Text>
          </Flex>
          <Box p={4}>
            {overview?.dutyWise?.length > 0 || summary.deputed > 0 || summary.onDuty > 0 ? (
              <VStack align="stretch" gap={2}>
                {overview?.dutyWise?.length > 0 ? overview.dutyWise.map((d) => (
                  <Flex key={d.dutyType} justifyContent="space-between" alignItems="center"
                    p={3} bg="gray.50" borderRadius="sm" borderLeft="3px solid #090884"
                    cursor="pointer"
                    onClick={() => navigate(`/stats/on-duty?type=${d.dutyType}`)}
                    _hover={{ bg: '#eeeeff', transform: 'translateX(3px)' }}
                    transition="all 0.2s">
                    <Text fontSize="14px" fontWeight="500" color="gray.700">
                      {dutyTypeHindi(d.dutyType)}
                    </Text>
                    <HStack gap={2}>
                      <Badge bg="#090884" color="white" px={3} py={1} borderRadius="full" fontSize="12px">
                        {d.total} अधिकारी
                      </Badge>
                      <ChevronRight size={14} color="#090884" />
                    </HStack>
                  </Flex>
                )) : summary.onDuty > 0 && (
                  <Flex justifyContent="space-between" alignItems="center"
                    p={3} bg="gray.50" borderRadius="sm" borderLeft="3px solid #090884"
                    cursor="pointer"
                    onClick={() => navigate('/stats/on-duty')}
                    _hover={{ bg: '#eeeeff', transform: 'translateX(3px)' }}
                    transition="all 0.2s">
                    <Text fontSize="14px" fontWeight="500" color="gray.700">सक्रिय ड्यूटी</Text>
                    <HStack gap={2}>
                      <Badge bg="#090884" color="white" px={3} py={1} borderRadius="full" fontSize="12px">
                        {summary.onDuty} अधिकारी
                      </Badge>
                      <ChevronRight size={14} color="#090884" />
                    </HStack>
                  </Flex>
                )}
                {summary.deputed > 0 && (
                  <Flex justifyContent="space-between" alignItems="center"
                    p={3} bg="gray.50" borderRadius="sm" borderLeft="3px solid #856404"
                    cursor="pointer"
                    onClick={() => navigate('/stats/deputed')}
                    _hover={{ bg: '#fff3cd', transform: 'translateX(3px)' }}
                    transition="all 0.2s">
                    <HStack gap={2}>
                      <Star size={15} color="#856404" />
                      <Text fontSize="14px" fontWeight="500" color="gray.700">प्रतिनियुक्त (Deputed)</Text>
                    </HStack>
                    <HStack gap={2}>
                      <Badge bg="#856404" color="white" px={3} py={1} borderRadius="full" fontSize="12px">
                        {summary.deputed} अधिकारी
                      </Badge>
                      <ChevronRight size={14} color="#856404" />
                    </HStack>
                  </Flex>
                )}
              </VStack>
            ) : (
              <Flex h="100px" alignItems="center" justifyContent="center" direction="column" gap={2}>
                <MapPin size={24} color="#ccc" />
                <Text color="gray.400" fontSize="14px">कोई सक्रिय ड्यूटी नहीं</Text>
              </Flex>
            )}
          </Box>
        </Box>

        {/* Today Holidays */}
        <Box bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
          <Flex bg="#090884" px={4} py={3} alignItems="center" justifyContent="space-between">
            <HStack gap={2}>
              <CalendarCheck size={16} color="white" />
              <Text color="white" fontWeight="600" fontSize="14px">
                आज छुट्टी पर ({todayHolidays.length})
              </Text>
            </HStack>
            {todayHolidays.length > 0 && (
              <Text fontSize="12px" color="rgba(255,255,255,0.7)" cursor="pointer"
                onClick={() => navigate('/stats/on-holiday')}
                _hover={{ color: 'white' }} transition="0.2s">
                सभी देखें →
              </Text>
            )}
          </Flex>
          <Box p={4}>
            {todayHolidays.length > 0 ? (
              <VStack align="stretch" gap={2} maxH="280px" overflowY="auto">
                {todayHolidays.map((h) => (
                  <Flex key={h._id} justifyContent="space-between" alignItems="center"
                    p={3} bg="gray.50" borderRadius="sm"
                    cursor="pointer"
                    onClick={() => navigate('/stats/on-holiday')}
                    _hover={{ bg: '#ffe5e5', transform: 'translateY(-1px)' }}
                    transition="all 0.2s">
                    <Box flex={1} minW={0}>
                      <Text fontSize="14px" fontWeight="600" color="gray.700" noOfLines={1}>{h.user?.name}</Text>
                      <Text fontSize="12px" color="gray.500">{h.reason || 'छुट्टी'}</Text>
                    </Box>
                    <HStack gap={2}>
                      <Badge
                        bg={h.status === 'ongoing' ? '#eeeeff' : '#fff3cd'}
                        color={h.status === 'ongoing' ? '#090884' : '#856404'}
                        px={2} py={1} borderRadius="full" fontSize="11px"
                      >
                        {statusHindi(h.status)}
                      </Badge>
                      <ChevronRight size={13} color="#fe0808" />
                    </HStack>
                  </Flex>
                ))}
              </VStack>
            ) : (
              <Flex h="100px" alignItems="center" justifyContent="center" direction="column" gap={2}>
                <CalendarCheck size={24} color="#ccc" />
                <Text color="gray.400" fontSize="14px">आज कोई छुट्टी नहीं</Text>
              </Flex>
            )}
          </Box>
        </Box>
      </SimpleGrid>

      {/* Available Officers */}
      {overview?.available?.length > 0 && (
        <Box bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden">
          <Flex bg="#090884" px={4} py={3} alignItems="center" justifyContent="space-between">
            <HStack gap={2}>
              <UserCheck size={16} color="white" />
              <Text color="white" fontWeight="600" fontSize="14px">
                उपलब्ध अधिकारी ({overview.available.length})
              </Text>
            </HStack>
            <Text fontSize="12px" color="rgba(255,255,255,0.7)" cursor="pointer"
              onClick={() => navigate('/stats/available')}
              _hover={{ color: 'white' }} transition="0.2s">
              सभी देखें →
            </Text>
          </Flex>
          <Box p={4}>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={3}>
              {overview.available.map((u) => (
                <Flex key={u._id} p={3} bg="gray.50" borderRadius="sm"
                  borderLeft="3px solid #090884" alignItems="center" gap={3}
                  cursor="pointer"
                  onClick={() => navigate('/stats/available')}
                  _hover={{ bg: '#eeeeff', transform: 'translateY(-1px)' }}
                  transition="all 0.2s">
                  <Box bg="#090884" borderRadius="full" p={2} flexShrink={0}>
                    <UserCheck size={14} color="white" />
                  </Box>
                  <Box minW={0} flex={1}>
                    <Text fontSize="13px" fontWeight="700" color="gray.700" noOfLines={1}>{u.name}</Text>
                    <Text fontSize="11px" color="gray.500">{u.designation?.name} • {u.pnoNumber}</Text>
                  </Box>
                  <ChevronRight size={14} color="#090884" />
                </Flex>
              ))}
            </SimpleGrid>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <Flex
    bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden"
    cursor={onClick ? 'pointer' : 'default'}
    onClick={onClick}
    _hover={onClick ? { boxShadow: 'md', transform: 'translateY(-2px)' } : {}}
    transition="all 0.2s"
    direction={{ base: 'column', sm: 'row' }}
    h={{ base: 'auto', sm: '90px' }}
  >
    {/* Icon block */}
    <Flex
      bg={color}
      w={{ base: 'full', sm: '75px' }}
      h={{ base: '6px', sm: 'auto' }}
      minH={{ base: '6px', sm: 'auto' }}
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      py={{ base: 0, sm: 0 }}
    >
      <Box display={{ base: 'none', sm: 'flex' }}>
        <Icon size={28} color="white" />
      </Box>
    </Flex>

    {/* Content */}
    <Flex direction="column" px={3} py={{ base: 3, sm: 0 }} justifyContent="center" flex="1" minW={0}>
      <HStack gap={2} mb={1}>
        <Box display={{ base: 'flex', sm: 'none' }} bg={color} borderRadius="full" p={1.5}>
          <Icon size={14} color="white" />
        </Box>
        <Text fontSize="11px" color="gray.500" fontWeight="700" textTransform="uppercase">
          {label}
        </Text>
      </HStack>
      <Text fontSize={{ base: '28px', sm: '26px' }} fontWeight="700" color="gray.800" lineHeight="1">
        {value}
      </Text>
    </Flex>

    {onClick && (
      <Flex alignItems="center" pr={3} display={{ base: 'none', sm: 'flex' }}>
        <ChevronRight size={16} color="#ccc" />
      </Flex>
    )}

    {/* Mobile tap arrow */}
    {onClick && (
      <Flex display={{ base: 'flex', sm: 'none' }}
        px={3} pb={2} justifyContent="flex-end" alignItems="center">
        <ChevronRight size={14} color="#ccc" />
      </Flex>
    )}
  </Flex>
);

const dutyTypeHindi = (type) => ({
  patrol: 'गश्त (Patrol)', guard: 'पहरा (Guard)', investigation: 'जांच (Investigation)',
  traffic: 'यातायात (Traffic)', special: 'विशेष (Special)', other: 'अन्य (Other)',
}[type] || type);

const statusHindi = (s) => ({ upcoming: 'आगामी', ongoing: 'चल रही', completed: 'समाप्त' }[s] || s);

export default Dashboard;


