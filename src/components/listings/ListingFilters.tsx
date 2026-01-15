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
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Status</Label>
        <Select
          value={filters.status || ''}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value as ListingFilters['status'] || undefined })}
        >
          <SelectTrigger className="h-12 rounded-2xl">
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

      <div className="space-y-2">
        <Label className="text-sm font-medium">Property Type</Label>
        <Select
          value={filters.propertyType || ''}
          onValueChange={(value) => onFiltersChange({ ...filters, propertyType: value as ListingFilters['propertyType'] || undefined })}
        >
          <SelectTrigger className="h-12 rounded-2xl">
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Min Price</Label>
          <Input
            type="number"
            placeholder="$0"
            className="h-12 rounded-2xl"
            value={filters.minPrice || ''}
            onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Max Price</Label>
          <Input
            type="number"
            placeholder="Any"
            className="h-12 rounded-2xl"
            value={filters.maxPrice || ''}
            onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Minimum Beds</Label>
        <Select
          value={filters.minBeds?.toString() || ''}
          onValueChange={(value) => onFiltersChange({ ...filters, minBeds: value ? Number(value) : undefined })}
        >
          <SelectTrigger className="h-12 rounded-2xl">
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

      <div className="space-y-2">
        <Label className="text-sm font-medium">Sort By</Label>
        <Select
          value={filters.sortBy || 'newest'}
          onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as ListingFilters['sortBy'] })}
        >
          <SelectTrigger className="h-12 rounded-2xl">
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
        <Button variant="outline" onClick={handleClearFilters} className="w-full h-12 rounded-2xl">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-12 h-14 rounded-2xl text-base"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          className="h-14 px-8 bg-gradient-primary text-white rounded-2xl shadow-glow hover:shadow-lg hover:scale-105 transition-all"
        >
          Search
        </Button>
        
        {/* Mobile Filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-14 w-14 rounded-2xl md:hidden">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="rounded-l-3xl">
            <SheetHeader>
              <SheetTitle className="font-display">Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block">
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={filters.status || ''}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value === 'all' ? undefined : value as ListingFilters['status'] })}
          >
            <SelectTrigger className="w-[140px] h-11 rounded-2xl">
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
            <SelectTrigger className="w-[140px] h-11 rounded-2xl">
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
            <SelectTrigger className="w-[120px] h-11 rounded-2xl">
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
            <SelectTrigger className="w-[130px] h-11 rounded-2xl">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price ↑</SelectItem>
              <SelectItem value="price_desc">Price ↓</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={handleClearFilters} 
              className="text-destructive hover:text-destructive h-11 px-4 rounded-2xl"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
