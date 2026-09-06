export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Skeleton */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-pulse">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-4 w-full">
                            <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
                            <div className="flex gap-4">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-32 animate-pulse">
                            <div className="h-10 w-10 bg-gray-200 rounded-xl mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>

                {/* Content Tabs Skeleton */}
                <div className="space-y-6">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 h-[280px] animate-pulse">
                                <div className="flex justify-between mb-4">
                                    <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

