import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Flex, Text, VStack, HStack, Badge, Spinner,
} from '@chakra-ui/react';
import {
  ArrowLeft, User, ClipboardList, MapPin, Calendar, Clock,
  UserCheck, UserX, CheckCircle, RefreshCw, Hash, Phone, Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserHistory, getUserById } from '../../api/services';
import PageHeader from '../../components/PageHeader';

const DUTY_TYPES = {
  patrol: 'गश्त', guard: 'पहरा', investigation: 'जांच',
  traffic: 'यातायात', special: 'विशेष', other: 'अन्य',
};

const actionConfig = {
  assigned:   { label: 'असाइन किया',     bg: '#eeeeff', color: '#090884', icon: UserCheck },
  reassigned: { label: 'पुनः असाइन',     bg: '#fff3cd', color: '#856404', icon: RefreshCw },
  removed:    { label: 'हटाया गया',      bg: '#ffe5e5', color: '#fe0808', icon: UserX },
  completed:  { label: 'पूर्ण किया',     bg: '#dcfce7', color: '#166534', icon: CheckCircle },
};

const OfficerHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uRes, hRes] = await Promise.all([getUserById(id), getUserHistory(id)]);
        setOfficer(uRes.data);
        setHistory(hRes.data.history || []);
        setStats(hRes.data.stats || null);
      } catch {
        toast.error('इतिहास लोड करने में समस्या हुई');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) return (
    <Flex h="60vh" alignItems="center" justifyContent="center">
      <VStack><Spinner size="xl" color="#090884" /><Text color="gray.500">लोड हो रहा है...</Text></VStack>
    </Flex>
  );

  return (
    <Box>
      <PageHeader
        title={`${officer?.name || 'फोर्स स्टाफ'} — ड्यूटी इतिहास`}
        subtitle="फोर्स स्टाफ की सभी ड्यूटी गतिविधियाँ"
        icon={ClipboardList}
      />

      {/* Back Button */}
      <Flex
        as="button" onClick={() => navigate('/officers')}
        alignItems="center" gap={2} mb={5} color="#090884"
        fontSize="14px" fontWeight="600" _hover={{ opacity: 0.7 }} transition="0.2s"
        bg="white" px={4} py={2} borderRadius="6px" boxShadow="sm"
        border="1px solid #e2e8f0"
      >
        <ArrowLeft size={16} /> वापस जाएं
      </Flex>

      {/* Officer Info Card */}
      {officer && (
        <Box bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden" mb={5}
          borderLeft="4px solid #090884">
          <Flex bg="#090884" px={4} py={3} alignItems="center" gap={3}>
            <Box bg="rgba(255,255,255,0.2)" borderRadius="full" p={2}>
              <User size={20} color="white" />
            </Box>
            <Box>
              <Text color="white" fontSize="16px" fontWeight="700">{officer.name}</Text>
              <Text color="rgba(255,255,255,0.7)" fontSize="12px">
                {officer.designation?.name || '—'}
              </Text>
            </Box>
            <Badge ml="auto" bg={officer.isActive ? '#22c55e' : '#fe0808'} color="white"
              px={3} py={1} borderRadius="full" fontSize="12px">
              {officer.isActive ? 'सक्रिय' : 'निष्क्रिय'}
            </Badge>
          </Flex>
          <Flex px={4} py={3} gap={6} flexWrap="wrap">
            <HStack gap={2} color="gray.600">
              <Hash size={14} color="#090884" />
              <Text fontSize="13px" fontWeight="600" color="#090884">{officer.pnoNumber}</Text>
            </HStack>
            <HStack gap={2} color="gray.600">
              <Phone size={14} />
              <Text fontSize="13px">{officer.phoneNumber}</Text>
            </HStack>
            <HStack gap={2} color="gray.600">
              <Award size={14} />
              <Text fontSize="13px">{officer.designation?.name || '—'}</Text>
            </HStack>
          </Flex>
        </Box>
      )}

      {/* Stats Cards */}
      {stats && (
        <Flex gap={3} mb={5} flexWrap="wrap">
          {[
            { label: 'कुल असाइनमेंट', value: stats.totalAssignments, bg: '#eeeeff', color: '#090884' },
            { label: 'पूर्ण ड्यूटी',   value: stats.totalCompleted,   bg: '#dcfce7', color: '#166534' },
            { label: 'हटाया गया',      value: stats.totalRemoved,     bg: '#ffe5e5', color: '#fe0808' },
            { label: 'कुल घंटे',       value: `${stats.totalHours}h`, bg: '#fff3cd', color: '#856404' },
          ].map((s) => (
            <Box key={s.label} bg={s.bg} borderRadius="sm" px={4} py={3}
              flex={{ base: '1 1 calc(50% - 6px)', sm: '1' }} minW="120px">
              <Text fontSize="22px" fontWeight="700" color={s.color}>{s.value}</Text>
              <Text fontSize="12px" color={s.color} opacity={0.8}>{s.label}</Text>
            </Box>
          ))}
        </Flex>
      )}

      {/* History Timeline */}
      {history.length === 0 ? (
        <Box bg="white" borderRadius="sm" p={10} textAlign="center" boxShadow="sm">
          <ClipboardList size={32} color="#ccc" style={{ margin: '0 auto 8px' }} />
          <Text color="gray.500" fontWeight="600">कोई ड्यूटी इतिहास नहीं मिला</Text>
          <Text color="gray.400" fontSize="13px">इस फोर्स स्टाफ को अभी तक कोई ड्यूटी असाइन नहीं हुई</Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={3}>
          <Text fontSize="13px" color="gray.500" px={1}>कुल {history.length} गतिविधियाँ</Text>
          {history.map((h, i) => {
            const cfg = actionConfig[h.action] || actionConfig.assigned;
            const ActionIcon = cfg.icon;
            return (
              <Box key={h._id} bg="white" borderRadius="sm" boxShadow="sm" overflow="hidden"
                borderLeft={`4px solid ${cfg.color}`}>
                {/* Header */}
                <Flex px={4} py={3} justifyContent="space-between" alignItems="center"
                  bg={cfg.bg} flexWrap="wrap" gap={2}>
                  <HStack gap={2}>
                    <ActionIcon size={15} color={cfg.color} />
                    <Text fontSize="14px" fontWeight="700" color={cfg.color}>{cfg.label}</Text>
                    <Text fontSize="12px" color="gray.500">#{history.length - i}</Text>
                  </HStack>
                  <HStack gap={2} flexWrap="wrap">
                    {h.dutyType === 'special' && (
                      <Badge bg="#fff3cd" color="#856404" px={2} borderRadius="full" fontSize="11px">
                        ★ विशेष
                      </Badge>
                    )}
                    <Badge bg="white" color={cfg.color} border={`1px solid ${cfg.color}`}
                      px={2} py={0.5} borderRadius="full" fontSize="11px">
                      {DUTY_TYPES[h.dutyType] || h.dutyType || '—'}
                    </Badge>
                  </HStack>
                </Flex>

                {/* Details */}
                <Box px={4} py={3}>
                  <VStack align="stretch" gap={2}>
                    {/* Duty Title */}
                    <Flex justifyContent="space-between" alignItems="center">
                      <HStack gap={2} color="gray.500"><ClipboardList size={13} /><Text fontSize="12px">ड्यूटी</Text></HStack>
                      <Text fontSize="13px" fontWeight="600" color="gray.700">
                        {h.duty?.title || '—'}
                      </Text>
                    </Flex>

                    {h.location && (
                      <>
                        <Box h="1px" bg="gray.100" />
                        <Flex justifyContent="space-between" alignItems="center">
                          <HStack gap={2} color="gray.500"><MapPin size={13} /><Text fontSize="12px">स्थान</Text></HStack>
                          <Text fontSize="13px" color="gray.700">{h.location}</Text>
                        </Flex>
                      </>
                    )}

                    {h.startDate && (
                      <>
                        <Box h="1px" bg="gray.100" />
                        <Flex justifyContent="space-between" alignItems="center">
                          <HStack gap={2} color="gray.500"><Calendar size={13} /><Text fontSize="12px">शुरू</Text></HStack>
                          <Text fontSize="13px" color="gray.700">
                            {new Date(h.startDate).toLocaleString('hi-IN')}
                          </Text>
                        </Flex>
                      </>
                    )}

                    {h.endDate && (
                      <>
                        <Box h="1px" bg="gray.100" />
                        <Flex justifyContent="space-between" alignItems="center">
                          <HStack gap={2} color="gray.500"><Calendar size={13} /><Text fontSize="12px">समाप्त</Text></HStack>
                          <Text fontSize="13px" color="gray.700">
                            {new Date(h.endDate).toLocaleString('hi-IN')}
                          </Text>
                        </Flex>
                      </>
                    )}

                    {h.duration != null && (
                      <>
                        <Box h="1px" bg="gray.100" />
                        <Flex justifyContent="space-between" alignItems="center">
                          <HStack gap={2} color="gray.500"><Clock size={13} /><Text fontSize="12px">अवधि</Text></HStack>
                          <Text fontSize="13px" fontWeight="600" color="#090884">{h.duration} घंटे</Text>
                        </Flex>
                      </>
                    )}

                    {h.remarks && (
                      <>
                        <Box h="1px" bg="gray.100" />
                        <Flex justifyContent="space-between" alignItems="flex-start" gap={4}>
                          <HStack gap={2} color="gray.500" flexShrink={0}><ClipboardList size={13} /><Text fontSize="12px">टिप्पणी</Text></HStack>
                          <Text fontSize="13px" color="gray.600" textAlign="right">{h.remarks}</Text>
                        </Flex>
                      </>
                    )}

                    {h.previousUser && (
                      <>
                        <Box h="1px" bg="gray.100" />
                        <Flex justifyContent="space-between" alignItems="center">
                          <HStack gap={2} color="gray.500"><UserX size={13} /><Text fontSize="12px">पहले था</Text></HStack>
                          <Text fontSize="13px" color="gray.600">{h.previousUser?.name}</Text>
                        </Flex>
                      </>
                    )}
                  </VStack>
                </Box>

                {/* Footer */}
                <Flex px={4} py={2} bg="gray.50" borderTop="1px solid" borderColor="gray.100"
                  justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Text fontSize="11px" color="gray.400">
                    {new Date(h.createdAt).toLocaleString('hi-IN')}
                  </Text>
                  {h.performedBy && (
                    <Text fontSize="11px" color="gray.400">
                      द्वारा: {h.performedBy?.name}
                    </Text>
                  )}
                </Flex>
              </Box>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

export default OfficerHistory;
