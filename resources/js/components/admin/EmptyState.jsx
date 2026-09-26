/** Mensaje cuando una lista está vacía. */
export default function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-14 text-center">
            {Icon && (
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                    <Icon className="size-7" aria-hidden="true" />
                </div>
            )}
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
