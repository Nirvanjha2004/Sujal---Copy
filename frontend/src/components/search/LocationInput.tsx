import { useState, useEffect, useRef } from 'react';
import { Icon } from "@iconify/react";

interface LocationSuggestion {
  id: string;
  name: string;
  type: 'city' | 'locality' | 'project';
  fullAddress: string;
}

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export function LocationInput({ 
  value, 
  onChange, 
  onLocationSelect,
  placeholder = "Enter city, locality, or project name",
  className = ""
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mock location data - in real implementation, this would come from Google Places API or backend
  const mockLocations: LocationSuggestion[] = [
    { id: '1', name: 'Mumbai', type: 'city', fullAddress: 'Mumbai, Maharashtra, India' },
    { id: '2', name: 'Delhi', type: 'city', fullAddress: 'Delhi, India' },
    { id: '3', name: 'Bangalore', type: 'city', fullAddress: 'Bangalore, Karnataka, India' },
    { id: '4', name: 'Hyderabad', type: 'city', fullAddress: 'Hyderabad, Telangana, India' },
    { id: '5', name: 'Chennai', type: 'city', fullAddress: 'Chennai, Tamil Nadu, India' },
    { id: '6', name: 'Pune', type: 'city', fullAddress: 'Pune, Maharashtra, India' },
    { id: '7', name: 'Kolkata', type: 'city', fullAddress: 'Kolkata, West Bengal, India' },
    { id: '8', name: 'Ahmedabad', type: 'city', fullAddress: 'Ahmedabad, Gujarat, India' },
    { id: '9', name: 'Bandra West', type: 'locality', fullAddress: 'Bandra West, Mumbai, Maharashtra' },
    { id: '10', name: 'Koramangala', type: 'locality', fullAddress: 'Koramangala, Bangalore, Karnataka' },
    { id: '11', name: 'Gurgaon', type: 'city', fullAddress: 'Gurgaon, Haryana, India' },
    { id: '12', name: 'Noida', type: 'city', fullAddress: 'Noida, Uttar Pradesh, India' },
    { id: '13', name: 'Whitefield', type: 'locality', fullAddress: 'Whitefield, Bangalore, Karnataka' },
    { id: '14', name: 'Andheri East', type: 'locality', fullAddress: 'Andheri East, Mumbai, Maharashtra' },
    { id: '15', name: 'DLF Cyber City', type: 'project', fullAddress: 'DLF Cyber City, Gurgaon, Haryana' },
  ];

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock locations based on query
    const filtered = mockLocations.filter(location =>
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.fullAddress.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8); // Limit to 8 suggestions
    
    setSuggestions(filtered);
    setLoading(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value) {
        searchLocations(value);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onChange(suggestion.name);
    setShowSuggestions(false);
    onLocationSelect?.(suggestion);
  };

  const getLocationIcon = (type: LocationSuggestion['type']) => {
    switch (type) {
      case 'city':
        return 'solar:city-bold';
      case 'locality':
        return 'solar:map-point-bold';
      case 'project':
        return 'solar:buildings-bold';
      default:
        return 'solar:map-point-bold';
    }
  };

  const getLocationTypeLabel = (type: LocationSuggestion['type']) => {
    switch (type) {
      case 'city':
        return 'City';
      case 'locality':
        return 'Locality';
      case 'project':
        return 'Project';
      default:
        return '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Icon 
          icon="solar:map-point-bold" 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" 
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {loading && (
          <Icon 
            icon="solar:refresh-bold" 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground animate-spin" 
          />
        )}
        {value && !loading && (
          <button
            onClick={() => {
              onChange('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground hover:text-foreground"
          >
            <Icon icon="solar:close-circle-bold" className="size-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-input rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary cursor-pointer border-b border-border last:border-b-0"
            >
              <Icon 
                icon={getLocationIcon(suggestion.type)} 
                className="size-5 text-muted-foreground flex-shrink-0" 
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {suggestion.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {suggestion.fullAddress}
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                {getLocationTypeLabel(suggestion.type)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {showSuggestions && value && !loading && suggestions.length === 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-input rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-3 px-4 py-3 text-muted-foreground">
            <Icon icon="solar:magnifer-bold" className="size-5" />
            <span className="text-sm">No locations found for "{value}"</span>
          </div>
        </div>
      )}
    </div>
  );
}