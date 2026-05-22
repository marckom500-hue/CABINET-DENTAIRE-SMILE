// src/components/Avatar.jsx
import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';

export default function Avatar({ user, size = 40 }) {
  // Générer un avatar unique basé sur l'email ou le nom de l'utilisateur
  const avatarSvg = createAvatar(lorelei, {
    seed: user?.email || `${user?.nom || ''}${user?.prenom || ''}${user?.id || ''}`,
    size: size,
    // Options optionnelles pour personnaliser
    backgroundColor: ['0f5b7a', '2c7da0', '3b82f6', '14b8a6', '10b981'],
    backgroundType: ['gradientLinear', 'solid'],
    hair: ['fonze', 'mrClean', 'pixie', 'bob', 'caveMan', 'elegant'],
    hairColor: ['0f5b7a', '2c7da0', '3b82f6', '14b8a6', '10b981', 'f59e0b', 'ef4444'],
    eyes: ['variant01', 'variant02', 'variant03', 'variant04', 'variant05'],
    mouth: ['variant01', 'variant02', 'variant03', 'variant04'],
    nose: ['variant01', 'variant02', 'variant03'],
    facialHair: ['variant01', 'variant02', 'variant03', 'variant04', 'variant05']
  });

  return (
    <img
      src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`}
      alt={`Avatar de ${user?.prenom || ''} ${user?.nom || ''}`}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}