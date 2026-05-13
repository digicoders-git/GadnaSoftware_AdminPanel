import { Flex, Text } from '@chakra-ui/react';

const StatCard = ({ icon: IconComponent, label, value, iconBg }) => {
  return (
    <Flex
      bg="white"
      borderRadius="2px"
      boxShadow="0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)"
      overflow="hidden"
      height="100px"
    >
      <Flex
        bg={iconBg}
        width="80px"
        alignItems="center"
        justifyContent="center"
        color="white"
      >
        <IconComponent size={32} />
      </Flex>
      <Flex direction="column" p={4} justifyContent="center" flex="1">
        <Text fontSize="12px" color="gray.500" fontWeight="600" textTransform="uppercase">
          {label}
        </Text>
        <Text fontSize="24px" fontWeight="700">
          {value}
        </Text>
      </Flex>
    </Flex>
  );
};

export default StatCard;


