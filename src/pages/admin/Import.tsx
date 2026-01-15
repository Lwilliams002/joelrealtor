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
import { Upload, FileText, Plus, Loader2, CloudUpload, Zap, Link as LinkIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImportListings() {
  const [isImporting, setIsImporting] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createListing = useCreateListing();

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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gradient">Import Listings</h1>
          </div>
          <p className="text-muted-foreground">Import listings from CSV or add them manually</p>
        </motion.div>

        <Tabs defaultValue="csv" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TabsList className="rounded-full bg-muted/50 p-1">
              <TabsTrigger value="csv" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-md">
                <CloudUpload className="h-4 w-4 mr-2" />
                CSV Upload
              </TabsTrigger>
              <TabsTrigger value="quick" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-md">
                <Zap className="h-4 w-4 mr-2" />
                Quick Add
              </TabsTrigger>
              <TabsTrigger value="idx" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-md">
                <LinkIcon className="h-4 w-4 mr-2" />
                IDX/MLS Feed
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* CSV Upload */}
          <TabsContent value="csv">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                  <CardTitle className="font-display flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Upload CSV File
                  </CardTitle>
                  <CardDescription>
                    Upload a CSV file with columns: title, address, city, state, zip, price, beds, baths, sqft, description, zillow_url
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="border-2 border-dashed border-border/50 rounded-3xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all duration-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                    >
                      <CloudUpload className="h-8 w-8 text-primary" />
                    </motion.div>
                    <p className="font-medium mb-1">Click to select a CSV file</p>
                    <p className="text-sm text-muted-foreground">
                      or drag and drop your file here
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleCSVUpload}
                    />
                  </motion.div>

                  {csvData.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="p-5 bg-success/10 border border-success/20 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-medium text-success">{csvData.length} listings ready to import</p>
                            <p className="text-sm text-muted-foreground">
                              Preview: {csvData[0]?.title || csvData[0]?.address || 'No title'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={importCSVListings} 
                        disabled={isImporting}
                        className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-xl transition-all hover-lift"
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
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Quick Add */}
          <TabsContent value="quick">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                  <CardTitle className="font-display flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Add Listing
                  </CardTitle>
                  <CardDescription>Quickly add a listing with minimal information</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleQuickAdd} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Title *</Label>
                        <Input 
                          value={quickAdd.title}
                          onChange={(e) => setQuickAdd({...quickAdd, title: e.target.value})}
                          placeholder="Beautiful 3BR Home"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Price *</Label>
                        <Input 
                          type="number"
                          value={quickAdd.price}
                          onChange={(e) => setQuickAdd({...quickAdd, price: e.target.value})}
                          placeholder="500000"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Address</Label>
                        <Input 
                          value={quickAdd.address}
                          onChange={(e) => setQuickAdd({...quickAdd, address: e.target.value})}
                          placeholder="123 Main St"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">City *</Label>
                        <Input 
                          value={quickAdd.city}
                          onChange={(e) => setQuickAdd({...quickAdd, city: e.target.value})}
                          placeholder="Austin"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">State</Label>
                        <Input 
                          value={quickAdd.state}
                          onChange={(e) => setQuickAdd({...quickAdd, state: e.target.value})}
                          placeholder="TX"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">ZIP</Label>
                        <Input 
                          value={quickAdd.zip}
                          onChange={(e) => setQuickAdd({...quickAdd, zip: e.target.value})}
                          placeholder="78701"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Beds</Label>
                        <Input 
                          type="number"
                          value={quickAdd.beds}
                          onChange={(e) => setQuickAdd({...quickAdd, beds: e.target.value})}
                          placeholder="3"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Baths</Label>
                        <Input 
                          type="number"
                          step="0.5"
                          value={quickAdd.baths}
                          onChange={(e) => setQuickAdd({...quickAdd, baths: e.target.value})}
                          placeholder="2"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Sq Ft</Label>
                        <Input 
                          type="number"
                          value={quickAdd.sqft}
                          onChange={(e) => setQuickAdd({...quickAdd, sqft: e.target.value})}
                          placeholder="2000"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Zillow URL</Label>
                        <Input 
                          value={quickAdd.zillow_url}
                          onChange={(e) => setQuickAdd({...quickAdd, zillow_url: e.target.value})}
                          placeholder="https://zillow.com/..."
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea 
                        value={quickAdd.description}
                        onChange={(e) => setQuickAdd({...quickAdd, description: e.target.value})}
                        placeholder="Property description..."
                        className="rounded-xl min-h-[100px]"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isImporting}
                      className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-xl transition-all hover-lift"
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
            </motion.div>
          </TabsContent>

          {/* IDX/MLS Feed */}
          <TabsContent value="idx">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                  <CardTitle className="font-display flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    IDX/MLS Feed Integration
                  </CardTitle>
                  <CardDescription>
                    Connect to your brokerage's IDX or MLS data feed for automatic listing sync
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="p-12 border-2 border-dashed border-border/50 rounded-3xl text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <LinkIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">
                      IDX/MLS integration requires configuration with your brokerage or MLS provider.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Contact your MLS provider to obtain API credentials, then configure them in Settings.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
