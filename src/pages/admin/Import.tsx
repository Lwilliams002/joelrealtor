import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCreateListing, generateSlug } from '@/hooks/useListings';
import { toast } from 'sonner';
import { Upload, FileText, Plus, Loader2 } from 'lucide-react';

export default function ImportListings() {
  const [isImporting, setIsImporting] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createListing = useCreateListing();

  // Manual quick add form
  const [quickAdd, setQuickAdd] = useState({
    title: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    price: '',
    beds: '',
    baths: '',
    sqft: '',
    description: '',
    zillow_url: '',
  });

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        return row;
      });

      setCsvData(data);
      toast.success(`Parsed ${data.length} listings from CSV`);
    };
    reader.readAsText(file);
  };

  const importCSVListings = async () => {
    if (csvData.length === 0) {
      toast.error('No CSV data to import');
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of csvData) {
      try {
        const slug = generateSlug(row.title || row.address, row.city);
        
        await createListing.mutateAsync({
          title: row.title || `${row.address}, ${row.city}`,
          address: row.address || '',
          city: row.city || '',
          state: row.state || '',
          zip: row.zip || '',
          price: parseFloat(row.price?.replace(/[^0-9.]/g, '')) || 0,
          beds: parseInt(row.beds) || undefined,
          baths: parseFloat(row.baths) || undefined,
          sqft: parseInt(row.sqft?.replace(/[^0-9]/g, '')) || undefined,
          description: row.description || '',
          zillow_url: row.zillow_url || row.zillowurl || null,
          slug,
          property_type: 'house',
          status: 'for_sale',
          source: 'csv',
          published: false,
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error('Import error:', error);
      }
    }

    setIsImporting(false);
    setCsvData([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    toast.success(`Imported ${successCount} listings${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quickAdd.title || !quickAdd.city || !quickAdd.price) {
      toast.error('Title, city, and price are required');
      return;
    }

    setIsImporting(true);

    try {
      const slug = generateSlug(quickAdd.title, quickAdd.city);
      
      await createListing.mutateAsync({
        title: quickAdd.title,
        address: quickAdd.address || quickAdd.title,
        city: quickAdd.city,
        state: quickAdd.state || '',
        zip: quickAdd.zip || '',
        price: parseFloat(quickAdd.price),
        beds: quickAdd.beds ? parseInt(quickAdd.beds) : undefined,
        baths: quickAdd.baths ? parseFloat(quickAdd.baths) : undefined,
        sqft: quickAdd.sqft ? parseInt(quickAdd.sqft) : undefined,
        description: quickAdd.description,
        zillow_url: quickAdd.zillow_url || null,
        slug,
        property_type: 'house',
        status: 'for_sale',
        source: 'manual',
        published: false,
      });

      setQuickAdd({
        title: '', address: '', city: '', state: '', zip: '',
        price: '', beds: '', baths: '', sqft: '', description: '', zillow_url: '',
      });
      
      toast.success('Listing added successfully');
    } catch (error) {
      console.error('Quick add error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">Import Listings</h1>
          <p className="text-muted-foreground mt-1">Import listings from CSV or add them manually</p>
        </div>

        <Tabs defaultValue="csv" className="space-y-6">
          <TabsList>
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
            <TabsTrigger value="quick">Quick Add</TabsTrigger>
            <TabsTrigger value="idx">IDX/MLS Feed</TabsTrigger>
          </TabsList>

          {/* CSV Upload */}
          <TabsContent value="csv">
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>
                  Upload a CSV file with columns: title, address, city, state, zip, price, beds, baths, sqft, description, zillow_url
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to select a CSV file
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCSVUpload}
                  />
                </div>

                {csvData.length > 0 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium">{csvData.length} listings ready to import</p>
                      <p className="text-sm text-muted-foreground">
                        Preview: {csvData[0]?.title || csvData[0]?.address || 'No title'}
                      </p>
                    </div>

                    <Button 
                      onClick={importCSVListings} 
                      disabled={isImporting}
                      className="bg-gradient-gold text-primary hover:opacity-90"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Import {csvData.length} Listings
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Add */}
          <TabsContent value="quick">
            <Card>
              <CardHeader>
                <CardTitle>Quick Add Listing</CardTitle>
                <CardDescription>Quickly add a listing with minimal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuickAdd} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input 
                        value={quickAdd.title}
                        onChange={(e) => setQuickAdd({...quickAdd, title: e.target.value})}
                        placeholder="Beautiful 3BR Home"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price *</Label>
                      <Input 
                        type="number"
                        value={quickAdd.price}
                        onChange={(e) => setQuickAdd({...quickAdd, price: e.target.value})}
                        placeholder="500000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input 
                        value={quickAdd.address}
                        onChange={(e) => setQuickAdd({...quickAdd, address: e.target.value})}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input 
                        value={quickAdd.city}
                        onChange={(e) => setQuickAdd({...quickAdd, city: e.target.value})}
                        placeholder="Austin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input 
                        value={quickAdd.state}
                        onChange={(e) => setQuickAdd({...quickAdd, state: e.target.value})}
                        placeholder="TX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP</Label>
                      <Input 
                        value={quickAdd.zip}
                        onChange={(e) => setQuickAdd({...quickAdd, zip: e.target.value})}
                        placeholder="78701"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Beds</Label>
                      <Input 
                        type="number"
                        value={quickAdd.beds}
                        onChange={(e) => setQuickAdd({...quickAdd, beds: e.target.value})}
                        placeholder="3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Baths</Label>
                      <Input 
                        type="number"
                        step="0.5"
                        value={quickAdd.baths}
                        onChange={(e) => setQuickAdd({...quickAdd, baths: e.target.value})}
                        placeholder="2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sq Ft</Label>
                      <Input 
                        type="number"
                        value={quickAdd.sqft}
                        onChange={(e) => setQuickAdd({...quickAdd, sqft: e.target.value})}
                        placeholder="2000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Zillow URL</Label>
                      <Input 
                        value={quickAdd.zillow_url}
                        onChange={(e) => setQuickAdd({...quickAdd, zillow_url: e.target.value})}
                        placeholder="https://zillow.com/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={quickAdd.description}
                      onChange={(e) => setQuickAdd({...quickAdd, description: e.target.value})}
                      placeholder="Property description..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isImporting}
                    className="bg-gradient-gold text-primary hover:opacity-90"
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Listing
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IDX/MLS Feed */}
          <TabsContent value="idx">
            <Card>
              <CardHeader>
                <CardTitle>IDX/MLS Feed Integration</CardTitle>
                <CardDescription>
                  Connect to your brokerage's IDX or MLS data feed for automatic listing sync
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-8 border-2 border-dashed rounded-lg text-center">
                  <p className="text-muted-foreground mb-4">
                    IDX/MLS integration requires configuration with your brokerage or MLS provider.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contact your MLS provider to obtain API credentials, then configure them in Settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
