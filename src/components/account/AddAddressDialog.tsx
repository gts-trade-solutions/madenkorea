import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface Address {
  id?: string;
  name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface AddAddressDialogProps {
  onAddressAdded: () => void;
  editAddress?: Address;
  onAddressUpdated?: () => void;
}

export const AddAddressDialog = ({ onAddressAdded, editAddress, onAddressUpdated }: AddAddressDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addressData, setAddressData] = useState<Address>({
    name: editAddress?.name || '',
    street_address: editAddress?.street_address || '',
    city: editAddress?.city || '',
    state: editAddress?.state || '',
    postal_code: editAddress?.postal_code || '',
    country: editAddress?.country || 'South Korea',
    is_default: editAddress?.is_default || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user } = useAuth();
  const { toast } = useToast();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!addressData.name.trim()) newErrors.name = 'Name is required';
    if (!addressData.street_address.trim()) newErrors.street_address = 'Street address is required';
    if (!addressData.city.trim()) newErrors.city = 'City is required';
    if (!addressData.state.trim()) newErrors.state = 'State is required';
    if (!addressData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !user) return;

    setIsLoading(true);

    try {
      const dataToSave = {
        ...addressData,
        user_id: user.id,
      };

      if (editAddress?.id) {
        // Update existing address
        const { error } = await supabase
          .from('saved_addresses')
          .update(dataToSave)
          .eq('id', editAddress.id);

        if (error) throw error;

        toast({
          title: "Address Updated",
          description: "Your address has been updated successfully.",
        });

        onAddressUpdated?.();
      } else {
        // If this is set as default, unset other defaults first
        if (addressData.is_default) {
          await supabase
            .from('saved_addresses')
            .update({ is_default: false })
            .eq('user_id', user.id);
        }

        // Add new address
        const { error } = await supabase
          .from('saved_addresses')
          .insert(dataToSave);

        if (error) throw error;

        toast({
          title: "Address Added",
          description: "Your new address has been added successfully.",
        });

        onAddressAdded();
      }

      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAddressData({
      name: '',
      street_address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'South Korea',
      is_default: false,
    });
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && !editAddress) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {editAddress ? 'Edit Address' : 'Add Address'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogDescription>
            {editAddress ? 'Update your address details.' : 'Add a new shipping address to your account.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Address Name</Label>
            <Input
              id="name"
              placeholder="e.g., Home, Office"
              value={addressData.name}
              onChange={(e) => setAddressData({ ...addressData, name: e.target.value })}
              required
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="street_address">Street Address</Label>
            <Input
              id="street_address"
              placeholder="Street address, apartment, suite, etc."
              value={addressData.street_address}
              onChange={(e) => setAddressData({ ...addressData, street_address: e.target.value })}
              required
            />
            {errors.street_address && <p className="text-xs text-destructive">{errors.street_address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={addressData.city}
                onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                required
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                placeholder="State or Province"
                value={addressData.state}
                onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                required
              />
              {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                placeholder="Postal code"
                value={addressData.postal_code}
                onChange={(e) => setAddressData({ ...addressData, postal_code: e.target.value })}
                required
              />
              {errors.postal_code && <p className="text-xs text-destructive">{errors.postal_code}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={addressData.country}
                onChange={(e) => setAddressData({ ...addressData, country: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={addressData.is_default}
              onCheckedChange={(checked) => setAddressData({ ...addressData, is_default: checked as boolean })}
            />
            <Label htmlFor="is_default" className="text-sm">
              Set as default shipping address
            </Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : editAddress ? "Update Address" : "Add Address"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};