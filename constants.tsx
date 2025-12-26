
import React from 'react';
import { LayoutDashboard, Home, MessageSquare, Settings, Activity, Users, Send } from 'lucide-react';

export const NAVIGATION = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, id: 'dashboard' },
  { name: 'Properties', icon: <Home size={20} />, id: 'properties' },
  { name: 'Leads', icon: <Users size={20} />, id: 'leads' },
  { name: 'Conversations', icon: <MessageSquare size={20} />, id: 'conversations' },
  { name: 'Automation', icon: <Activity size={20} />, id: 'automation' },
  { name: 'Settings', icon: <Settings size={20} />, id: 'settings' },
];

export const MOCK_PROPERTIES = [];
