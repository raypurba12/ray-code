import type { ReactNode } from 'react';
import {
    Bug,
    Code2,
    Globe,
    Layers,
    LifeBuoy,
    MessageSquareCode,
    SearchCode,
    Smartphone,
    Wrench,
    Rocket,
    ShieldCheck,
    Gauge,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
    globe: Globe,
    layers: Layers,
    bug: Bug,
    'search-code': SearchCode,
    'message-square-code': MessageSquareCode,
    'life-buoy': LifeBuoy,
    code: Code2,
    smartphone: Smartphone,
    wrench: Wrench,
    rocket: Rocket,
    shield: ShieldCheck,
    gauge: Gauge,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }): ReactNode {
    const Icon = iconMap[name] ?? Code2;
    return <Icon className={className} strokeWidth={1.8} />;
}
