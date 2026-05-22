import Skeleton from "./Skeleton"

type MetricCardProps = {
    label:    string
    value:    number | undefined
    sub?:     string
    accent?:  'default' | 'danger' | 'warn' | 'ok' | 'info'
    loading?: boolean
}
 
const accentMap = {
    default: 'text-gray-900',
    danger:  'text-red-600',
    warn:    'text-amber-600',
    ok:      'text-green-700',
    info:    'text-blue-700',
}


 
export default function MetricCard({ label, value, sub, accent = 'default', loading }: MetricCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{label}</p>
            {loading
                ? <Skeleton className="h-8 w-16 mb-1" />
                : <p className={`text-3xl font-semibold ${accentMap[accent]}`}>{value ?? '—'}</p>
            }
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    )
}