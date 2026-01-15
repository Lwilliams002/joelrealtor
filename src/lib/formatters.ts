export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatPropertyType(type: string): string {
  const types: Record<string, string> = {
    house: 'House',
    condo: 'Condo',
    townhouse: 'Townhouse',
    land: 'Land',
    multi_family: 'Multi-Family',
    commercial: 'Commercial',
    other: 'Other',
  };
  return types[type] || type;
}

export function formatListingStatus(status: string): string {
  const statuses: Record<string, string> = {
    for_sale: 'For Sale',
    for_rent: 'For Rent',
    sold: 'Sold',
    pending: 'Pending',
  };
  return statuses[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    for_sale: 'bg-success text-success-foreground',
    for_rent: 'bg-accent text-accent-foreground',
    sold: 'bg-destructive text-destructive-foreground',
    pending: 'bg-muted text-muted-foreground',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}
