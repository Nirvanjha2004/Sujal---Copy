import { EnhancedList, ListItem } from "@/shared/components/ui/enhanced-list";
import { Property } from "../../types";
import { formatPrice, formatArea } from "../../utils/propertyHelpers";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useNavigate } from "react-router-dom";

interface EnhancedPropertyListProps {
  properties: Property[];
  loading?: boolean;
  variant?: 'default' | 'compact' | 'detailed' | 'grid';
  showFavorites?: boolean;
  showStats?: boolean;
  onPropertyClick?: (property: Property) => void;
  className?: string;
}

export function EnhancedPropertyList({
  properties,
  loading = false,
  variant = 'default',
  showFavorites = true,
  showStats: _showStats = false,
  onPropertyClick,
  className,
}: EnhancedPropertyListProps) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();

  const handlePropertyClick = (property: Property) => {
    if (onPropertyClick) {
      onPropertyClick(property);
    } else {
      navigate(`/property/${property.id}`);
    }
  };

  const handleFavoriteToggle = async (propertyId: number) => {
    try {
      await toggleFavorite(propertyId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getImageUrl = (property: Property) => {
    const primaryImage = property.images?.find(img => img.is_primary);
    const firstImage = property.images?.[0];
    return primaryImage?.large_url || 
           firstImage?.large_url ||
           "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
  };


  
  const getArea = (property: Property) => 
    property.area_sqft || 0;

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'available':
        return 'success';
      case 'under_construction':
        return 'warning';
      case 'sold':
      case 'rented':
        return 'error';
      case 'new':
        return 'info';
      default:
        return 'default';
    }
  };

  // Convert properties to list items
  const listItems: ListItem[] = properties.map((property) => {
    const actions = [];
    
    if (showFavorites) {
      actions.push({
        icon: isFavorite(property.id) ? "solar:heart-bold" : "solar:heart-linear",
        label: isFavorite(property.id) ? "Remove from favorites" : "Add to favorites",
        onClick: () => handleFavoriteToggle(property.id),
        variant: "ghost" as const,
      });
    }

    actions.push({
      icon: "solar:eye-bold",
      label: "View Details",
      onClick: () => handlePropertyClick(property),
      variant: "outline" as const,
    });

    const metadata = [
      {
        icon: "solar:home-2-bold",
        label: "Area",
        value: formatArea(getArea(property)),
      },
      {
        icon: "solar:bed-bold",
        label: "Bedrooms",
        value: `${property.bedrooms || 0} BHK`,
      },
      {
        icon: "solar:bath-bold",
        label: "Bathrooms",
        value: property.bathrooms || 0,
      },
    ];

    // Note: stats removed as not available in Property type
    
    return {
      id: property.id,
      title: property.title,
      subtitle: `${property.city}, ${property.state}`,
      description: property.description,
      image: getImageUrl(property),
      badge: property.is_featured ? {
        text: "Featured",
        variant: "default" as const,
      } : undefined,
      metadata,
      actions,
      status: property.status ? {
        text: property.status.replace('_', ' '),
        color: getStatusColor(property.status),
      } : undefined,
    };
  });

  const emptyState = {
    icon: "solar:home-2-bold",
    title: "No properties found",
    description: "There are no properties matching your criteria. Try adjusting your filters or search terms.",
    action: {
      label: "Browse All Properties",
      onClick: () => navigate('/properties'),
    },
  };

  return (
    <EnhancedList
      items={listItems}
      loading={loading}
      variant={variant}
      showImages={true}
      showActions={true}
      showMetadata={true}
      emptyState={emptyState}
      onItemClick={(item) => {
        const property = properties.find(p => p.id === item.id);
        if (property) {
          handlePropertyClick(property);
        }
      }}
      className={className}
    />
  );
}

// Property List with Price Display
interface PropertyListWithPriceProps extends EnhancedPropertyListProps {
  showPriceInTitle?: boolean;
}

export function PropertyListWithPrice({
  properties,
  showPriceInTitle = true,
  ...props
}: PropertyListWithPriceProps) {
  const modifiedProperties = showPriceInTitle ? properties.map(property => ({
    ...property,
    title: `${property.title} - ${formatPrice(property.price)}`,
  })) : properties;

  return <EnhancedPropertyList {...props} properties={modifiedProperties} />;
}

// Compact Property List for Sidebars
export function CompactPropertyList(props: EnhancedPropertyListProps) {
  return (
    <EnhancedPropertyList
      {...props}
      variant="compact"
      showFavorites={false}
      showStats={false}
    />
  );
}

// Grid Property List for Gallery View
export function GridPropertyList(props: EnhancedPropertyListProps) {
  return (
    <EnhancedPropertyList
      {...props}
      variant="grid"
    />
  );
}