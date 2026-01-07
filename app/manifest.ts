import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VaultHub - Ansible Vault Encryption & Decryption',
    short_name: 'VaultHub',
    description: 'A modern, secure web application for encrypting and decrypting Ansible vault strings',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1714',
    theme_color: '#c67f32',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
