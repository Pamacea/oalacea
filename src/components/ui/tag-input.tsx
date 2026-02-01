'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

const PREDEFINED_TAGS = [
  'React',
  'Nextjs',
  'Solidjs',
  'Threejs',
  'R3F',
  'WASM',
  'Rust',
  'Nunjuck',
  'Vitejs',
  'Typescript',
  'TailwindCSS',
  'HTML',
  'CSS',
  'Javascript',
  'Java',
  'Python',
  'Nodejs',
  'GraphQL',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Kubernetes',
  'AWS',
  'Vercel',
  'Prisma',
  'Zod',
  'Zustand',
  'TanStack Query',
  'Shadcn UI',
  'Framer Motion',
  'Redux',
  'Webpack',
  'ESLint',
  'Prettier',
  'Jest',
  'Playwright',
  'Git',
  'Figma',
  'SASS',
  'Less',
  'Vuejs',
  'Angular',
  'Svelte',
  'Astro',
  'Remix',
  'Nuxt',
  'Express',
  'Fastify',
  'NestJS',
  'Django',
  'Flask',
  'Spring',
  'Laravel',
  'Go',
  'C++',
  'C#',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'Dart',
  'Flutter',
];

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ value, onChange, placeholder = 'Add tags...', className = '' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = PREDEFINED_TAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tag)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setInputValue('');
    } else if (e.key === 'ArrowDown' && showSuggestions && filteredSuggestions.length > 0) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedTags = pastedText
      .split(/[;,]/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    const newTags = pastedTags.filter((tag) => !value.includes(tag));
    if (newTags.length > 0) {
      onChange([...value, ...newTags]);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex flex-wrap gap-2 rounded-none border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-sm focus-within:border-imperium-crimson focus-within:shadow-[4px_4px_0_rgba(154,17,21,0.3)] transition-all`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-none border-2 border-imperium-crimson bg-imperium-crimson/20 px-2 py-0.5 text-xs font-display uppercase tracking-wider text-imperium-crimson"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-imperium-bone transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-none border-2 border-imperium-steel-dark bg-imperium-black shadow-[8px_8px_0_rgba(28,28,28,0.6)]">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full px-3 py-2 text-left font-terminal text-sm text-imperium-steel hover:bg-imperium-crimson/20 hover:text-imperium-crimson transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <p className="mt-1 font-terminal text-xs text-imperium-steel-dark">
          {'>'} Select a tag or type and press Enter. You can also paste multiple tags separated by commas or semicolons.
        </p>
      )}
    </div>
  );
}
