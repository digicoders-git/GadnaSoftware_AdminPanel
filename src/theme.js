import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          primary: { value: '#010080' },     // UP Police Blue
          secondary: { value: '#ce9a31' },   // UP Police Gold
          accent: { value: '#ee232b' },      // UP Police Red
          header: { value: '#010080' },
          sidebar: { value: '#1a1a9e' },
          sidebarHover: { value: '#010080' },
          active: { value: '#ce9a31' },
          text: { value: '#e8e8f0' },
          bg: { value: '#f5f5f8' },
        },
        stats: {
          users: { value: '#010080' },
          likes: { value: '#ce9a31' },
          uploads: { value: '#ee232b' },
          stars: { value: '#d9534f' },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: '#f5f5f8',
      color: 'gray.800',
      fontFamily: `'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif`,
    },
    'input:focus, input:focus-visible, textarea:focus, textarea:focus-visible, select:focus, select:focus-visible': {
      outline: 'none',
      boxShadow: 'none',
      borderColor: '#090884',
    },
  },
});

export default createSystem(defaultConfig, customConfig);
