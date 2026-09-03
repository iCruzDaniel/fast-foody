import type { CategoryInfo } from '../../types';

interface CategoryTabsProps {
  categories: CategoryInfo[];
  activeCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  className?: string;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategorySelect,
  className = '',
}: CategoryTabsProps) {
  return (
    <div className={`flex gap-2 overflow-x-auto scrollbar-hide py-2 ${className}`}>
      <button
        onClick={() => onCategorySelect(null)}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          activeCategory === null
            ? 'bg-brand-red text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        }`}
      >
        All
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            activeCategory === category.id
              ? 'bg-brand-red text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          <span className="mr-1.5">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
}