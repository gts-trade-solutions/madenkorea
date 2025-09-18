import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Building, Mail, Phone, User } from "lucide-react";

export default function SupplierRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    businessLicense: "",
    taxId: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "South Korea",
    },
    bankDetails: {
      bankName: "",
      accountNumber: "",
      accountHolder: "",
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.contactPerson.trim())
      newErrors.contactPerson = "Contact person is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.street.trim())
      newErrors.street = "Street address is required";
    if (!formData.address.city.trim()) newErrors.city = "City is required";
    if (!formData.address.state.trim()) newErrors.state = "State is required";
    if (!formData.address.postalCode.trim())
      newErrors.postalCode = "Postal code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in first to register as a supplier.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Check if user is already registered as a supplier
      const { data: existingSupplier } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingSupplier) {
        toast({
          title: "Already Registered",
          description: "You are already registered as a supplier.",
          variant: "destructive",
        });
        navigate("/supplier");
        return;
      }

      // Insert supplier data
      const { error } = await supabase.from("suppliers").insert({
        user_id: user.id,
        company_name: formData.companyName,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        business_license: formData.businessLicense || null,
        tax_id: formData.taxId || null,
        address: formData.address,
        bank_details: formData.bankDetails,
        status: "pending",
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Registration Submitted",
        description:
          "Your supplier registration has been submitted for review. You'll be notified once approved.",
      });

      navigate("/supplier");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description:
          error.message || "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="h-12 w-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                Consumer Innovations
              </span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Supplier Registration
            </CardTitle>
            <CardDescription>
              Register your business to become a supplier and start selling your
              products on our platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="Your company name"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                    />
                    {errors.companyName && (
                      <p className="text-xs text-destructive">
                        {errors.companyName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Contact person name"
                      value={formData.contactPerson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: e.target.value,
                        })
                      }
                    />
                    {errors.contactPerson && (
                      <p className="text-xs text-destructive">
                        {errors.contactPerson}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@company.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      placeholder="+82 10 1234 5678"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive">{errors.phone}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessLicense">
                      Business License (Optional)
                    </Label>
                    <Input
                      id="businessLicense"
                      placeholder="Business license number"
                      value={formData.businessLicense}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessLicense: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID (Optional)</Label>
                    <Input
                      id="taxId"
                      placeholder="Tax identification number"
                      value={formData.taxId}
                      onChange={(e) =>
                        setFormData({ ...formData, taxId: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    placeholder="Street address"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          street: e.target.value,
                        },
                      })
                    }
                  />
                  {errors.street && (
                    <p className="text-xs text-destructive">{errors.street}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            city: e.target.value,
                          },
                        })
                      }
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive">{errors.city}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            state: e.target.value,
                          },
                        })
                      }
                    />
                    {errors.state && (
                      <p className="text-xs text-destructive">{errors.state}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      placeholder="Postal code"
                      value={formData.address.postalCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            postalCode: e.target.value,
                          },
                        })
                      }
                    />
                    {errors.postalCode && (
                      <p className="text-xs text-destructive">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Bank Details (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      placeholder="Bank name"
                      value={formData.bankDetails.bankName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: {
                            ...formData.bankDetails,
                            bankName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountHolder">Account Holder</Label>
                    <Input
                      id="accountHolder"
                      placeholder="Account holder name"
                      value={formData.bankDetails.accountHolder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: {
                            ...formData.bankDetails,
                            accountHolder: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Bank account number"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: {
                          ...formData.bankDetails,
                          accountNumber: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Registration
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
