import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';

export type IconProps = {
  name:
    | keyof typeof Ionicons.glyphMap
    | keyof typeof FontAwesome6.glyphMap
    | keyof typeof MaterialIcons.glyphMap;
  family?: 'Ionicons' | 'FontAwesome6' | 'MaterialIcons';
  size?: number;
  color?: string;
};

export function Icon({ name, family = 'Ionicons', size = 24, color = '#000' }: IconProps) {
  if (family === 'FontAwesome6') {
    return <FontAwesome6 name={name as any} size={size} color={color} />;
  }
  if (family === 'MaterialIcons') {
    return <MaterialIcons name={name as any} size={size} color={color} />;
  }
  return <Ionicons name={name as any} size={size} color={color} />;
}
