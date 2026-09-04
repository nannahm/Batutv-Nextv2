'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tag as TagIcon, X, Plus, Check } from 'lucide-react';
import { AdminTag, TagContentType } from '@/src/types/admin';
import { getStoredTags, TAGS_UPDATED_EVENT } from '@/src/data/tagAdminStore';

interface TaxonomyTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  contentType?: TagContentType;
  placeholder?: string;
  label?: string;
}

export const TaxonomyTagInput: React.FC<TaxonomyTagInputProps> = ({
  tags = [],
  onChange,
  contentType,
  placeholder = 'Ketik tag atau pilih dari saran...',
  label = 'Tag & Topik',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState<AdminTag[]>(() => {
    return getStoredTags().filter((t) => t.status === 'active');
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync available tags with local cache and realtime store events
  useEffect(() => {
    const handleTagsUpdate = () => {
      setAvailableTags(getStoredTags().filter((t) => t.status === 'active'));
    };

    window.addEventListener(TAGS_UPDATED_EVENT, handleTagsUpdate);
    return () => {
      window.removeEventListener(TAGS_UPDATED_EVENT, handleTagsUpdate);
    };
  }, []);

  // Filter available tags for this content type
  const relevantTags = useMemo(() => {
    return availableTags.filter((t) => {
      if (!contentType) return true;
      return t.contentTypes ? t.contentTypes.includes(contentType) : true;
    });
  }, [availableTags, contentType]);

  // Suggestions matching user typed input
  const query = inputValue.trim().toLowerCase();
  const filteredSuggestions = useMemo(() => {
    if (!query) return [];
    return relevantTags.filter(
      (t) =>
        t.name.toLowerCase().includes(query) &&
        !tags.some((selected) => selected.toLowerCase() === t.name.toLowerCase())
    );
  }, [query, relevantTags, tags]);

  // Quick chips: Top 5 popular or relevant tags not currently selected
  const quickSuggestions = useMemo(() => {
    return relevantTags
      .filter((t) => !tags.some((selected) => selected.toLowerCase() === t.name.toLowerCase()))
      .slice(0, 5);
  }, [relevantTags, tags]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue('');
      return;
    }
    onChange([...tags, trimmed]);
    setInputValue('');
    setIsDropdownOpen(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[0].name);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === ',' || e.key === ';') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const exactMatchExists = relevantTags.some(
    (t) => t.name.toLowerCase() === query
  );

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800">
            {label}
          </label>
          <span className="text-[10px] text-slate-400 font-medium">
            {tags.length} dipilih (Tekan Enter/Koma)
          </span>
        </div>
      )}

      {/* Box container for tags and input */}
      <div className="relative">
        <div className="min-h-[42px] p-1.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all flex flex-wrap items-center gap-1.5">
          {/* Selected Tag Badges */}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs group hover:border-red-300 transition-colors"
            >
              <TagIcon className="w-3 h-3 text-red-500" />
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-slate-400 hover:text-red-600 rounded-md p-0.5 transition-colors focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Text Input */}
          <div className="flex-1 min-w-[140px] flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? placeholder : 'Tambah lagi...'}
              className="w-full bg-transparent border-0 px-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        {isDropdownOpen && inputValue.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto py-1">
            {filteredSuggestions.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => addTag(t.name)}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-red-50 hover:text-red-700 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <TagIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{t.name}</span>
                </span>
                <span className="text-[10px] text-slate-400">Pilih</span>
              </button>
            ))}

            {!exactMatchExists && query && (
              <button
                type="button"
                onClick={() => addTag(inputValue.trim())}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat tag baru: &ldquo;{inputValue.trim()}&rdquo;</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Suggestion Chips */}
      {quickSuggestions.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] text-slate-400 font-medium">Saran:</span>
          {quickSuggestions.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => addTag(t.name)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-2 py-0.5 rounded-md transition-colors"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
