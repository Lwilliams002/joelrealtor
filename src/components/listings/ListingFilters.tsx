import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export interface ListingFilters {
  city?: string;
  status?: 'for_sale' | 'for_rent' | 'sold' | 'pending';
  propertyType?: 'house' | 'condo' | 'townhouse' | 'land' | 'multi_family' | 'commercial' | 'other';
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
}

interface ListingFiltersProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
}

export function ListingFiltersComponent({ filters, onFiltersChange }: ListingFiltersProps) {
  const [searchCity, setSearchCity] = useState(filters.city || '');

  const handleSearch = () => {
    onFiltersChange({ ...filters, city: searchCity || undefined });
  };

  const handleClearFilters = () => {
    setSearchCity('');
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={filters.status || ''}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value as ListingFilters['status'] || undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="for_sale">For Sale</SelectItem>
            <SelectItem value="for_rent">For Rent</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <Label>Property Type</Label>
        <Select
          value={filters.propertyType || ''}
          onValueChange={(value) => onFiltersChange({ ...filters, propertyType: value as ListingFilters['propertyType'] || undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="condo">Condo</SelectItem>
            <SelectItem value="townhouse">Townhouse</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="multi_family">Multi-Family</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>Min Price</Label>
          <Input
            type="number"
            placeholder="$0"
            value={filters.minPrice || ''}
            onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label>Max Price</Label>
          <Input
            type="number"
            placeholder="Any"
            value={filters.maxPrice || ''}
            onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      {/* Beds */}
      <div className="space-y-2">
        <Label>Minimum Beds</Label>
        <Select
          value={filters.minBeds?.toString() || ''}
          onValueChange={(value) => onFiltersChange({ ...filters, minBeds: value ? Number(value) : undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="5">5+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={filters.sortBy || 'newest'}
          onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as ListingFilters['sortBy'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Newest First" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={handleClearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} className="bg-gradient-gold text-primary hover:opacity-90">
          Search
        </Button>
        
        {/* Mobile Filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block">
        <div className="grid grid-cols-5 gap-4">
          <Select
            value={filters.status || ''}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value === 'all' ? undefined : value as ListingFilters['status'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="for_sale">For Sale</SelectItem>
              <SelectItem value="for_rent">For Rent</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.propertyType || ''}
            onValueChange={(value) => onFiltersChange({ ...filters, propertyType: value === 'all' ? undefined : value as ListingFilters['propertyType'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="multi_family">Multi-Family</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.minBeds?.toString() || ''}
            onValueChange={(value) => onFiltersChange({ ...filters, minBeds: value === 'any' ? undefined : Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Beds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Beds</SelectItem>
              <SelectItem value="1">1+ Beds</SelectItem>
              <SelectItem value="2">2+ Beds</SelectItem>
              <SelectItem value="3">3+ Beds</SelectItem>
              <SelectItem value="4">4+ Beds</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy || 'newest'}
            onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as ListingFilters['sortBy'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price ↑</SelectItem>
              <SelectItem value="price_desc">Price ↓</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={handleClearFilters} className="text-destructive">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
