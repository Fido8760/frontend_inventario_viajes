
export default function ErrorMessage({ children }: { children: React.ReactNode }) {
    return (
        <p className="mt-1 text-xs text-red-500">
            {children}
        </p>
    )
}