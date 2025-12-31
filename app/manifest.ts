import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VaultHub - Ansible Vault Encryption & Decryption',
    short_name: 'VaultHub',
    description: 'A modern, secure web application for encrypting and decrypting Ansible vault strings',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}

