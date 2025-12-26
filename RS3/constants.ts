import { UserRole, FreshnessLevel } from './types';

export const APP_NAME = "ReServe";

export const MOCK_DELAY = 600; // Simulate network latency

// Colors for Freshness Labels
export const FRESHNESS_COLORS = {
  [FreshnessLevel.FRESH]: 'bg-green-100 text-green-800 border-green-200',
  [FreshnessLevel.RISKY]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [FreshnessLevel.NOT_FRESH]: 'bg-red-100 text-red-800 border-red-200',
  [FreshnessLevel.UNKNOWN]: 'bg-gray-100 text-gray-800 border-gray-200',
};

// Colors for Roles
export const ROLE_COLORS = {
  [UserRole.DONOR]: 'bg-blue-600',
  [UserRole.NGO]: 'bg-emerald-600',
  [UserRole.ADMIN]: 'bg-purple-600',
};