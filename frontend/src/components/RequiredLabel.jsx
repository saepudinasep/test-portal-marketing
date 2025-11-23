export default function RequiredLabel({ children }) {
    return (
        <label className="font-medium text-sm text-gray-700 dark:text-gray-200">
            {children} <span className="text-red-500">*</span>
        </label>
    );
}
