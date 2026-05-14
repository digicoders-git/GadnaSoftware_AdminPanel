import { Box, Flex, Text, Button, Portal, VStack } from '@chakra-ui/react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

/**
 * type: 'danger' | 'warning' | 'success' | 'info'
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'हाँ, करें',
  cancelText = 'डिलीट करें',
  type = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  const config = {
    danger:  { icon: XCircle,       iconColor: '#fe0808', btnBg: '#fe0808', btnHover: '#d10606' },
    warning: { icon: AlertTriangle, iconColor: '#fe0808', btnBg: '#fe0808', btnHover: '#d10606' },
    success: { icon: CheckCircle,   iconColor: '#090884', btnBg: '#090884', btnHover: '#06066e' },
    info:    { icon: Info,          iconColor: '#090884', btnBg: '#090884', btnHover: '#06066e' },
  }[type] || config.danger;

  const Icon = config.icon;

  return (
    <Portal>
      <Box
        position="fixed" inset="0" bg="blackAlpha.700" zIndex="1400"
        display="flex" alignItems="center" justifyContent="center" p={4}
      >
        <Box
          bg="white" borderRadius="8px" boxShadow="2xl"
          w={{ base: 'full', sm: '400px' }} overflow="hidden"
        >
          {/* Top color bar */}
          <Box h="4px" bg={config.iconColor} />

          <Box p={6}>
            <VStack gap={4} align="center">
              <Box
                bg={`${config.iconColor}18`}
                borderRadius="full" p={4}
                border={`2px solid ${config.iconColor}40`}
              >
                <Icon size={32} color={config.iconColor} />
              </Box>

              <Box textAlign="center">
                <Text fontSize="17px" fontWeight="700" color="gray.800" mb={1}>
                  {title}
                </Text>
                <Text fontSize="14px" color="gray.600" lineHeight="1.6">
                  {message}
                </Text>
              </Box>

              <Flex gap={3} w="full" pt={1}>
                <Button
                  flex="1" variant="outline" onClick={onClose}
                  fontSize="14px" h="40px" borderRadius="6px"
                  disabled={loading}
                >
                  {cancelText}
                </Button>
                <Button
                  flex="1" bg={config.btnBg} color="white"
                  _hover={{ bg: config.btnHover }}
                  onClick={onConfirm} fontSize="14px" h="40px"
                  borderRadius="6px" loading={loading}
                  loadingText="प्रतीक्षा करें..."
                >
                  {confirmText}
                </Button>
              </Flex>
            </VStack>
          </Box>
        </Box>
      </Box>
    </Portal>
  );
};

export default ConfirmDialog;


