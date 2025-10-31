import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type DropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SketchDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  disabled?: boolean;
};

export const SketchDropdown = ({
  value,
  onChange,
  options,
  disabled = false,
}: SketchDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Manually handle the scroll
    container.scrollTop += e.deltaY;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`sketch-border cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <div className="sketch-border-inner">
          <div className="sketch-border-content bg-white px-3 py-1 flex items-center gap-2 min-w-[130px] justify-between">
            <span className="font-semibold text-base whitespace-nowrap">
              {selectedOption?.label || value}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full mt-2 z-50 min-w-full">
          <div className="sketch-border">
            <div className="sketch-border-inner">
              <div
                className="sketch-border-content bg-white"
                style={{ overflow: "hidden" }}
              >
                <div
                  ref={scrollContainerRef}
                  className="nowheel"
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    overflowX: "hidden",
                    overscrollBehavior: "contain",
                    WebkitOverflowScrolling: "touch",
                  }}
                  onWheel={handleScroll}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      disabled={option.disabled}
                      className={`w-full text-left px-3 py-2 font-semibold text-base transition-colors ${
                        option.disabled
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-gray-100 cursor-pointer"
                      } ${option.value === value ? "bg-gray-50" : ""}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
