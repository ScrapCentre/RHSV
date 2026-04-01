export default function AdminLoading() {
    return (
        <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading Dashboard...</p>
            </div>
        </div>
    )
}

