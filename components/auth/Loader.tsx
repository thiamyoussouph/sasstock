// components/ui/Loader.tsx
export default function Loader() {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );
}
