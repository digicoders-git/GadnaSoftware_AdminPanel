import { Box, Flex, Text, HStack } from '@chakra-ui/react';
import { Home } from 'lucide-react';

const PageHeader = ({ title, subtitle, icon: Icon }) => (
  <Flex
    justifyContent="space-between"
    alignItems="center"
    mb={6}
    bg="white"
    p={4}
    borderRadius="sm"
    boxShadow="sm"
    borderLeft="4px solid #090884"
  >
    <HStack>
      {Icon && <Icon size={22} color="#090884" />}
      <Box>
        <Text fontSize="20px" fontWeight="600" color="gray.700">{title}</Text>
        {subtitle && <Text fontSize="12px" color="gray.500">{subtitle}</Text>}
      </Box>
    </HStack>
    <HStack gap={1}>
      <Home size={13} color="gray.400" />
      <Text fontSize="12px" color="gray.500">{title}</Text>
    </HStack>
  </Flex>
);

export default PageHeader;


