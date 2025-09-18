import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Save, Eye, Trash2 } from 'lucide-react';

interface LogoSettings {
  main_logo: string;
  footer_logo: string;
  favicon: string;
  mobile_logo: string;
}

export const LogoManager = () => {
  const [logos, setLogos] = useState<LogoSettings>({
    main_logo: '',
    footer_logo: '',
    favicon: '',
    mobile_logo: ''
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch current logo settings
  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['main_logo', 'footer_logo', 'favicon', 'mobile_logo']);

      if (error) throw error;

      const logoSettings: Partial<LogoSettings> = {};
      data?.forEach(setting => {
        logoSettings[setting.setting_key as keyof LogoSettings] = setting.setting_value;
      });

      setLogos(prev => ({ ...prev, ...logoSettings }));
    } catch (error) {
      console.error('Error fetching logos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch logo settings",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (file: File, logoType: keyof LogoSettings) => {
    if (!file) return;

    setUploading(logoType);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${logoType}-${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // Update site settings
      await saveLogo(logoType, publicUrl);

      toast({
        title: "Success",
        description: `${logoType.replace('_', ' ')} uploaded successfully`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${logoType.replace('_', ' ')}`,
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  const saveLogo = async (logoType: keyof LogoSettings, url: string) => {
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', logoType)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: url, updated_at: new Date().toISOString() })
          .eq('setting_key', logoType);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('site_settings')
          .insert({
            setting_key: logoType,
            setting_value: url,
            setting_type: 'text',
            category: 'branding',
            description: `${logoType.replace('_', ' ')} URL`,
            is_active: true
          });
        
        if (error) throw error;
      }

      // Update local state
      setLogos(prev => ({ ...prev, [logoType]: url }));

    } catch (error) {
      console.error('Error saving logo:', error);
      throw error;
    }
  };

  const handleUrlSave = async (logoType: keyof LogoSettings, url: string) => {
    if (!url.trim()) return;

    try {
      await saveLogo(logoType, url.trim());
      toast({
        title: "Success",
        description: `${logoType.replace('_', ' ')} URL saved successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save ${logoType.replace('_', ' ')} URL`,
        variant: "destructive"
      });
    }
  };

  const handleRemoveLogo = async (logoType: keyof LogoSettings) => {
    try {
      await saveLogo(logoType, '');
      toast({
        title: "Success",
        description: `${logoType.replace('_', ' ')} removed successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to remove ${logoType.replace('_', ' ')}`,
        variant: "destructive"
      });
    }
  };

  const LogoUploadCard = ({ 
    logoType, 
    title, 
    description,
    currentUrl 
  }: { 
    logoType: keyof LogoSettings; 
    title: string; 
    description: string;
    currentUrl: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Logo Preview */}
        {currentUrl && (
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <img 
                src={currentUrl} 
                alt={title}
                className="h-12 w-12 object-contain bg-white rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <p className="text-sm font-medium">Current Logo</p>
                <p className="text-xs text-muted-foreground truncate max-w-xs">
                  {currentUrl}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewUrl(currentUrl)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveLogo(logoType)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Upload New Logo */}
        <div className="space-y-3">
          <Label>Upload New Logo</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleImageUpload(file, logoType);
                };
                input.click();
              }}
              disabled={uploading === logoType}
              className="flex-1"
            >
              {uploading === logoType ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Manual URL Input */}
        <div className="space-y-3">
          <Label>Or Enter Image URL</Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/logo.png"
              value={currentUrl}
              onChange={(e) => setLogos(prev => ({ ...prev, [logoType]: e.target.value }))}
            />
            <Button
              onClick={() => handleUrlSave(logoType, currentUrl)}
              size="icon"
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Logo Management</h2>
        <p className="text-muted-foreground">
          Upload and manage your site logos. Recommended formats: PNG, SVG, or JPG.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LogoUploadCard
          logoType="main_logo"
          title="Main Logo"
          description="Primary logo displayed in the header and navigation"
          currentUrl={logos.main_logo}
        />

        <LogoUploadCard
          logoType="footer_logo"
          title="Footer Logo"
          description="Logo displayed in the website footer"
          currentUrl={logos.footer_logo}
        />

        <LogoUploadCard
          logoType="mobile_logo"
          title="Mobile Logo"
          description="Optimized logo for mobile devices (optional)"
          currentUrl={logos.mobile_logo}
        />

        <LogoUploadCard
          logoType="favicon"
          title="Favicon"
          description="Small icon displayed in browser tabs (16x16 or 32x32px)"
          currentUrl={logos.favicon}
        />
      </div>

      {/* Logo Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Logo Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Main Logo</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Recommended size: 200x60px or 300x90px</li>
                <li>• Format: PNG with transparent background</li>
                <li>• High contrast for readability</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Favicon</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Size: 16x16px, 32x32px, or 64x64px</li>
                <li>• Format: PNG, ICO, or SVG</li>
                <li>• Simple design that works at small sizes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewUrl && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="max-w-4xl max-h-4xl p-4">
            <img 
              src={previewUrl} 
              alt="Logo Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};