import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as lucide from 'lucide-react';

const pkg = JSON.parse(
  readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
) as { dependencies: Record<string, string> };

const installed = lucide as unknown as Record<string, unknown>;

// Every icon the application imports from lucide-react. The 1.74.0 update is
// only safe if these existing exports survive the bump.
const APP_ICONS = [
  'AlertCircle',
  'AlertTriangle',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUpDown',
  'BarChart3',
  'Bell',
  'Calendar',
  'Check',
  'CheckCheck',
  'CheckCircle2',
  'ChevronDown',
  'ChevronLeft',
  'ChevronRight',
  'Clock',
  'Download',
  'Eye',
  'EyeOff',
  'Filter',
  'Flame',
  'GripVertical',
  'Info',
  'Kanban',
  'Layers',
  'LayoutDashboard',
  'Loader2',
  'Lock',
  'LogOut',
  'Menu',
  'MessageSquare',
  'Moon',
  'Plus',
  'Search',
  'Send',
  'Shield',
  'Sun',
  'Trash2',
  'Undo2',
  'User',
  'UserCheck',
  'X',
] as const;

describe('lucide-react 1.74.0 update', () => {
  it('declares a lucide-react range at or above 1.74.0', () => {
    const declared = pkg.dependencies['lucide-react'];
    expect(declared).toBeDefined();

    const [major, minor] = declared.replace(/^[^0-9]*/, '').split('.').map(Number);
    expect(major * 1000 + minor).toBeGreaterThanOrEqual(1074);
  });

  it('keeps every icon the app imports available', () => {
    for (const icon of APP_ICONS) {
      expect(installed[icon], `missing lucide-react export: ${icon}`).toBeDefined();
    }
  });

  it('provides the axis replacements named in the breaking change', () => {
    expect(installed.SquareAxisDashedHorizontal).toBeDefined();
    expect(installed.SquareAxisDashedVertical).toBeDefined();
    expect(installed.NigerianNaira).toBeDefined();
  });
});
