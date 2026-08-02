"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  multiSelect?: boolean;
  icon?: React.ReactNode;
}

export default function FilterDropdown({
  label,
  options,
  selectedValues,
  onSelectionChange,
  multiSelect = true,
  icon,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = (value: string) => {
    if (multiSelect) {
      if (selectedValues.includes(value)) {
        onSelectionChange(selectedValues.filter((v) => v !== value));
      } else {
        onSelectionChange([...selectedValues, value]);
      }
    } else {
      onSelectionChange([value]);
      setIsOpen(false);
    }
  };

  const activeCount = selectedValues.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-input rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors flex items-center gap-2 text-body-sm text-inverse-on-surface"
      >
        {icon}
        <span>{label}</span>
        {activeCount > 0 && (
          <span className="ml-1 w-5 h-5 rounded-full bg-primary-container/30 text-[10px] font-bold text-inverse-primary flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 glass-panel border border-white/10 rounded-xl p-2 shadow-2xl z-50"
          >
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-body-sm transition-colors ${
                    isSelected
                      ? "bg-primary-container/15 text-inverse-primary"
                      : "text-outline hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary-container" />}
                </button>
              );
            })}

            {multiSelect && selectedValues.length > 0 && (
              <button
                onClick={() => {
                  onSelectionChange([]);
                  setIsOpen(false);
                }}
                className="w-full mt-1 px-3 py-2 rounded-lg text-body-sm text-outline hover:text-error hover:bg-error/5 transition-colors text-left border-t border-white/5"
              >
                Clear All
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
